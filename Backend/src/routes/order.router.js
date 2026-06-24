import { Router } from "express";
import { displayAllOrders, retryPayment, cancelOrder } from "../controllers/order.controller.js";

const order_router = Router();

// GET all orders (all statuses) with payment info
order_router.get("/all", displayAllOrders);

// POST create a fresh Stripe session for a pending-payment order
order_router.post("/:orderId/pay", retryPayment);

// DELETE cancel a pending/shipment order (queues inventory revert)
order_router.delete("/:orderId/cancel", cancelOrder);

export { order_router };