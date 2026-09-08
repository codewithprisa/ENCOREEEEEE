import express from "express";
import {
  getTotalRevenue,
  getTotalOrders,
  getTotalTicketsSold,
  getBestSellingEvents,
  getPaymentStatistics,
  getRefundStatistics,
  getTargetSales,
} from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/revenue", getTotalRevenue);
router.get("/orders", getTotalOrders);
router.get("/tickets", getTotalTicketsSold);
router.get("/best-events", getBestSellingEvents);
router.get("/payments", getPaymentStatistics);
router.get("/refunds", getRefundStatistics);
router.get("/target-sales", getTargetSales);

export default router;