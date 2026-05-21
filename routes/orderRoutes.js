const router = require('express').Router();
const { placeOrder, getOrders, getOrderById, updateStatus } = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and tracking
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customer_id, items]
 *             properties:
 *               customer_id: { type: integer }
 *               delivery_address: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     product_id: { type: integer }
 *                     quantity: { type: integer }
 *     responses:
 *       201: { description: Order placed }
 *       400: { description: Insufficient stock or invalid data }
 */
router.post('/', authenticate, placeOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get orders (Admin sees all, customer sees own)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/', authenticate, getOrders);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details with items and tracking
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Order details }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status and tracking note (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, processing, out_for_delivery, delivered, cancelled]
 *               tracking_note: { type: string }
 *     responses:
 *       200: { description: Status updated }
 */
router.patch('/:id/status', authenticate, authorizeAdmin, updateStatus);

module.exports = router;
