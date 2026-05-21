const db = require('../config/db');

const getAll = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
  res.json(rows);
};

const getOne = async (req, res) => {
  const [rows] = await db.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ message: 'Customer not found' });
  res.json(rows[0]);
};

const create = async (req, res) => {
  const { name, email, phone, address } = req.body;
  if (!name || !email) return res.status(400).json({ message: 'name and email are required' });

  const [result] = await db.query(
    'INSERT INTO customers (name, email, phone, address) VALUES (?,?,?,?)',
    [name, email, phone, address]
  );
  res.status(201).json({ message: 'Customer created', customerId: result.insertId });
};

const update = async (req, res) => {
  const { name, email, phone, address } = req.body;
  const [result] = await db.query(
    'UPDATE customers SET name=?, email=?, phone=?, address=? WHERE id=?',
    [name, email, phone, address, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Customer not found' });
  res.json({ message: 'Customer updated' });
};

const remove = async (req, res) => {
  const [result] = await db.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ message: 'Customer not found' });
  res.json({ message: 'Customer deleted' });
};

module.exports = { getAll, getOne, create, update, remove };
