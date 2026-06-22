import { Router } from "express";
import { cancelOrder, displaycompletedOrders, displaypendingOrders } from "../controllers/order.controller.js";
const order_router=Router();
order_router.get("/pending",displaypendingOrders);
order_router.get('/completed',displaycompletedOrders);
order_router.delete('/:orderId/cancel', cancelOrder)

export {order_router}