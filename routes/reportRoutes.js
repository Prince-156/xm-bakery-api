const router = require('express').Router();
const { salesReport, inventoryReport, topProducts } = require('../controllers/reportController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Sales and inventory reports
 */

/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Get daily sales report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200: { description: Sales report data }
 */
router.get('/sales', authenticate, authorizeAdmin, salesReport);

/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Get inventory levels report (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Inventory report with stock status }
 */
router.get('/inventory', authenticate, authorizeAdmin, inventoryReport);

/**
 * @swagger
 * /api/reports/top-products:
 *   get:
 *     summary: Get top 10 best-selling products (Admin only)
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Top products by sales }
 */
router.get('/top-products', authenticate, authorizeAdmin, topProducts);

module.exports = router;
