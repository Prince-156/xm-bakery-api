const router = require('express').Router();
const { getAll, getOne, create, update, remove } = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products with optional search/filter/sort
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by product name
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *       - in: query
 *         name: minQty
 *         schema: { type: integer }
 *       - in: query
 *         name: maxQty
 *         schema: { type: integer }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, price, quantity, created_at] }
 *       - in: query
 *         name: order
 *         schema: { type: string, enum: [ASC, DESC] }
 *     responses:
 *       200: { description: List of products }
 */
router.get('/', authenticate, getAll);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a single product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Product details }
 *       404: { description: Not found }
 */
router.get('/:id', authenticate, getOne);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name: { type: string }
 *               category_id: { type: integer }
 *               price: { type: number }
 *               quantity: { type: integer }
 *               description: { type: string }
 *     responses:
 *       201: { description: Product created }
 */
router.post('/', authenticate, authorizeAdmin, create);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
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
 *               category_id: { type: integer }
 *               price: { type: number }
 *               quantity: { type: integer }
 *               description: { type: string }
 *     responses:
 *       200: { description: Product updated }
 */
router.put('/:id', authenticate, authorizeAdmin, update);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Product deleted }
 */
router.delete('/:id', authenticate, authorizeAdmin, remove);

module.exports = router;
