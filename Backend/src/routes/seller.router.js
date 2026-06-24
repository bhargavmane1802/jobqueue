import { Router } from "express";
import { createProduct, deleteProduct, displayProducts, productDetails, updateProduct } from "../controllers/seller.controller.js";
import upload from "../services/cloudinary.service.js";
const sellerRouter=Router();
sellerRouter.post('/create',upload.array("images",4),createProduct);
sellerRouter.get('/products',displayProducts);
sellerRouter.get('/product/:productId',productDetails);
sellerRouter.put('/product/:productId',updateProduct);
sellerRouter.delete('/product/:productId',deleteProduct);
export {sellerRouter}