import { Router } from "express";
import { createOrder, getCartItems, removeItem, updateItem } from "../controllers/cart.controller.js";
import { addToCart } from "../controllers/buyer.controller.js";
export const cartRouter=Router();
cartRouter.post('/cartToOrder',createOrder);
cartRouter.get('/getcart',getCartItems);
cartRouter.post('/addtocart/:productId',addToCart);
cartRouter.patch('/update/',updateItem);
cartRouter.delete('/delete/',removeItem);

