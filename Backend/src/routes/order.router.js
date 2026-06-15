import { Router } from "express";
import { display_order, displayProducts, process_new_order, productDetails } from "../controllers/order.controller.js";
const order_router=Router();
order_router.post("/create",process_new_order);
order_router.get("/:order_id",display_order);
order_router.get("/products",displayProducts);
order_router.get('/product/:productId',productDetails);

export {order_router}