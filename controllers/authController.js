const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  const { fullname, email, password, role = 'customer', phone, address } = req.body;
  if (!fullname || !email || !password)
    return res.status(400).json({ message: 'name, email and password are required' });

  const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existing.length) return res.status(409).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    'INSERT INTO users (fullname, email, password, role) VALUES (?,?,?,?)',
    [fullname, email, hashed, role]
  );

  if (role === 'customer') {
    await db.query(
      'INSERT INTO customers (id, fullname, email) VALUES (?,?,?)',
      [result.insertId, fullname, email]
    );
  }

  res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'email and password are required' });

  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) return res.status(401).json({ message: 'Invalid credentials' });

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({ token, user: { id: user.id, fullname: user.fullname, email: user.email, role: user.role } });
};

module.exports = { register, login };
