import { Router } from "express";
import { displaycompletedOrders, displaypendingOrders } from "../controllers/order.controller.js";
const order_router=Router();
order_router.get("/pending",displaypendingOrders);
order_router.get('/completed',displaycompletedOrders);

export {order_router}