const db = require('../config/db');

const getAll = async (req, res) => {
  const { category, minPrice, maxPrice, minQty, maxQty, search, sortBy = 'name', order = 'ASC' } = req.query;

  const allowed = ['name', 'price', 'quantity', 'created_at'];
  const sortCol = allowed.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

  let sql = `SELECT p.*, c.name AS category_name FROM products p
             LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];

  if (search) { sql += ' AND p.name LIKE ?'; params.push(`%${search}%`); }
  if (category) { sql += ' AND c.name = ?'; params.push(category); }
  if (minPrice) { sql += ' AND p.price >= ?'; params.push(minPrice); }
  if (maxPrice) { sql += ' AND p.price <= ?'; params.push(maxPrice); }
  if (minQty) { sql += ' AND p.quantity >= ?'; params.push(minQty); }
  if (maxQty) { sql += ' AND p.quantity <= ?'; params.push(maxQty); }

  sql += ` ORDER BY p.${sortCol} ${sortOrder}`;

  const [rows] = await db.query(sql, params);
  res.json(rows);
};

const getOne = async (req, res) => {
  const [rows] = await db.query(
    'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?',
    [req.params.id]
  );
  if (!rows.length) return res.status(404).json({ message: 'Product not found' });
  res.json(rows[0]);
};

const create = async (req, res) => {
  const { name, category_id, price, quantity, description } = req.body;
  if (!name || !price) return res.status(400).json({ message: 'name and price are required' });

  const [result] = await db.query(
    'INSERT INTO products (name, category_id, price, quantity, description) VALUES (?,?,?,?,?)',
    [name, category_id, price, quantity || 0, description]
  );
  res.status(201).json({ message: 'Product created', productId: result.insertId });
};

const update = async (req, res) => {
  const { name, category_id, price, quantity, description } = req.body;
  const [result] = await db.query(
    'UPDATE products SET name=?, category_id=?, price=?, quantity=?, description=? WHERE id=?',
    [name, category_id, price, quantity, description, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product updated' });
};

const remove = async (req, res) => {
  const [result] = await db.query('DELETE FROM products WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product deleted' });
};

module.exports = { getAll, getOne, create, update, remove };
