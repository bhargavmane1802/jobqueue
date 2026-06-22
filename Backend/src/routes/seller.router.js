import { Router } from "express";
import { createProduct, deleteProduct, displayProducts, productDetails, updateProduct } from "../controllers/seller.controller.js";
const sellerRouter=Router();
sellerRouter.post('/create',createProduct);
sellerRouter.get('/products',displayProducts);
sellerRouter.get('/product/:productId',productDetails);
sellerRouter.put('/product/:productId',updateProduct);
sellerRouter.delete('/product/:productId',deleteProduct);
export {sellerRouter}