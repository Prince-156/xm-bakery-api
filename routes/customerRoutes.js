const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/customerController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer management
 */

/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: List of customers }
 */
router.get('/', authenticate, authorizeAdmin, getAll);

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get a single customer (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Customer details }
 */
router.get('/:id', authenticate, authorizeAdmin, getOne);

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a customer (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       201: { description: Customer created }
 */
router.post('/', authenticate, authorizeAdmin, create);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update a customer (Admin only)
 *     tags: [Customers]
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
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               address: { type: string }
 *     responses:
 *       200: { description: Customer updated }
 */
router.put('/:id', authenticate, authorizeAdmin, update);

/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer (Admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Customer deleted }
 */
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;
