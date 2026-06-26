import { query } from "../config/database.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary (same credentials used by the upload service)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: extract the Cloudinary public_id from a full URL
// e.g. "https://res.cloudinary.com/<cloud>/image/upload/v123/jobQueue_app_uploads/abc.jpg"
//  → "jobQueue_app_uploads/abc"
const extractPublicId = (url) => {
  try {
    const parts = url.split("/");
    const uploadIdx = parts.indexOf("upload");
    // skip version segment (v<digits>) if present
    let start = uploadIdx + 1;
    if (/^v\d+$/.test(parts[start])) start++;
    const withExt = parts.slice(start).join("/");
    return withExt.replace(/\.[^.]+$/, ""); // strip extension
  } catch {
    return null;
  }
};

export const displayProducts = async (req, res, next) => {
  try {
    const { id } = req.user;
    const products = await query(
      "select * from products where seller_id=$1",
      [id]
    );
    return res.status(200).json(products.rows);
  } catch (error) {
    console.log("displayProducts");
    next(error);
  }
};

export const productDetails = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { id } = req.user;
    const product = await query(
      "select * from products where id=$1 and seller_id=$2",
      [productId, id]
    );
    if (product.rows.length === 0) throw new Error("product not found");
    return res.status(200).json({ product: product.rows[0] });
  } catch (error) {
    console.log("productDetails");
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, stock_quantity } = req.body;
    const { id } = req.user;
    const imageUrls = req.files ? req.files.map((file) => file.path) : [];
    const product = await query(
      "insert into products (seller_id,title,description,price,stock_quantity,product_images) values ($1,$2,$3,$4,$5,$6) returning *",
      [id, title, description, price, stock_quantity, imageUrls]
    );
    return res.status(201).json({ product: product.rows[0] });
  } catch (error) {
    console.log("createProduct");
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { title, description, price, stock_quantity } = req.body;
    const { productId } = req.params;
    const { id } = req.user;

    // ── Basic field validation ────────────────────────────────────────────────
    if (!title || !description || price === undefined || stock_quantity === undefined || !productId)
      return res.status(400).json({ message: "insufficient data" });

    if (isNaN(price) || Number(price) <= 0)
      return res.status(400).json({ message: "invalid price" });

    if (isNaN(stock_quantity) || Number(stock_quantity) < 0)
      return res.status(400).json({ message: "invalid stock_quantity" });

    // ── Validate new stock_quantity >= reserved_quantity ──────────────────────
    const current = await query(
      "SELECT reserved_quantity, product_images FROM products WHERE id=$1 AND seller_id=$2",
      [productId, id]
    );
    if (current.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    const reserved = current.rows[0].reserved_quantity || 0;
    if (Number(stock_quantity) < reserved) {
      return res.status(400).json({
        message: `stock_quantity cannot be less than reserved quantity (${reserved} units are reserved by pending orders)`,
      });
    }

    // ── Image management ───────────────────────────────────────────────────────
    // deletedImages: JSON array of URLs that the frontend removed from the list
    // req.files: new files uploaded in this request (may be empty)
    let deletedImages = [];
    try {
      deletedImages = req.body.deletedImages
        ? JSON.parse(req.body.deletedImages)
        : [];
    } catch {
      deletedImages = [];
    }

    const existingImages = current.rows[0].product_images || [];

    // 1. Remove deleted images from the existing array
    const remainingImages = existingImages.filter(
      (url) => !deletedImages.includes(url)
    );

    // 2. Delete removed images from Cloudinary (fire-and-forget with logging)
    if (deletedImages.length > 0) {
      const deletePromises = deletedImages.map(async (url) => {
        const publicId = extractPublicId(url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (e) {
            console.error(`Failed to delete Cloudinary image ${publicId}:`, e.message);
          }
        }
      });
      await Promise.allSettled(deletePromises);
    }

    // 3. Add any newly uploaded images (multer puts them in req.files)
    const newImageUrls = req.files ? req.files.map((f) => f.path) : [];
    const finalImages = [...remainingImages, ...newImageUrls];

    // Enforce max 4 images total
    if (finalImages.length > 4) {
      return res.status(400).json({ message: "Maximum 4 images allowed per product" });
    }

    // ── DB update ─────────────────────────────────────────────────────────────
    const product = await query(
      `UPDATE products
       SET title=$2,
           description=$3,
           price=$4,
           stock_quantity=$5,
           product_images=$6
       WHERE id=$7 AND seller_id=$1
       RETURNING *`,
      [id, title, description, price, stock_quantity, finalImages, productId]
    );

    if (product.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    return res.status(200).json({ product: product.rows[0] });
  } catch (error) {
    console.log("updateProduct");
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { productId } = req.params;
    if (!productId) return res.status(400).json({ message: "insufficient data" });
    const { id } = req.user;

    // Fetch images before deleting so we can clean up Cloudinary
    const existing = await query(
      "SELECT product_images FROM products WHERE id=$1 AND seller_id=$2",
      [productId, id]
    );
    if (existing.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    const imageUrls = existing.rows[0].product_images || [];

    const product = await query(
      "delete from products where id=$1 and seller_id=$2 returning id",
      [productId, id]
    );
    if (product.rows.length === 0)
      return res.status(404).json({ message: "product not found" });

    // Clean up Cloudinary images after successful delete
    if (imageUrls.length > 0) {
      const deletePromises = imageUrls.map(async (url) => {
        const publicId = extractPublicId(url);
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId);
          } catch (e) {
            console.error(`Failed to delete Cloudinary image ${publicId}:`, e.message);
          }
        }
      });
      await Promise.allSettled(deletePromises);
    }

    return res.status(200).json({ message: "product deleted" });
  } catch (error) {
    console.log("deleteProduct");
    next(error);
  }
};
