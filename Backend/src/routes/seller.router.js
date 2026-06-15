import { Router } from "express";
import { displayProducts, productDetails } from "../controllers/seller.controller";
const sellerRouter=Router();
sellerRouter.get('/products',displayProducts);
sellerRouter.get('/:productId',productDetails)
export {sellerRouter}