import { Router } from "express";
import { display_order, process_new_order } from "../controllers/order.controller.js";
const order_router=Router();
order_router.post("/create",process_new_order);
order_router.get("/:order_id",display_order)
export {order_router}