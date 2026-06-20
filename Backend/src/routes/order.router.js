import { Router } from "express";
import { createOrder, display_order, displayProducts, productDetails } from "../controllers/order.controller.js";
const order_router=Router();
order_router.post("/create",createOrder);
order_router.get("/products",displayProducts);
order_router.get('/product/:productId',productDetails);
order_router.get("/:order_id",display_order);

export {order_router}