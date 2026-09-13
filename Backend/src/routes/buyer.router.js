import { Router } from "express";
import { buySingleItem, displayProducts, productDetails } from "../controllers/buyer.controller.js";
import { createComment } from "../controllers/comments.controller.js";
export const buyerRouter=Router();
buyerRouter.get('/products',displayProducts);
// buyerRouter.post('/product/addtocart',addToCart);
buyerRouter.post('/buyProduct',buySingleItem);
buyerRouter.get('/product/:productId',productDetails);
buyerRouter.post('/product/addComment',createComment);
