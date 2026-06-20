import { Router } from "express";
import { createProduct, displayProducts, productDetails } from "../controllers/seller.controller.js";
const sellerRouter=Router();
sellerRouter.post('/create',createProduct);
sellerRouter.get('/products',displayProducts);
sellerRouter.get('/product/:productId',productDetails);
export {sellerRouter}