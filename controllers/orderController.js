const db = require('../config/db');

const placeOrder = async (req, res) => {
  const { customer_id, delivery_address, items } = req.body;
  if (!customer_id || !items || !items.length)
    return res.status(400).json({ message: 'customer_id and items are required' });

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total = 0;
    const enriched = [];

    for (const item of items) {
      const [rows] = await conn.query('SELECT price, quantity FROM products WHERE id = ?', [item.product_id]);
      if (!rows.length) throw new Error(`Product ${item.product_id} not found`);
      if (rows[0].quantity < item.quantity) throw new Error(`Insufficient stock for product ${item.product_id}`);
      enriched.push({ ...item, unit_price: rows[0].price });
      total += rows[0].price * item.quantity;
    }

    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, total_amount, delivery_address) VALUES (?,?,?)',
      [customer_id, total, delivery_address]
    );
    const orderId = orderResult.insertId;

    for (const item of enriched) {
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)',
        [orderId, item.product_id, item.quantity, item.unit_price]
      );
      await conn.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    await conn.commit();
    res.status(201).json({ message: 'Order placed successfully', orderId, total });
  } catch (err) {
    await conn.rollback();
    res.status(400).json({ message: err.message });
  } finally {
    conn.release();
  }
};

const getOrders = async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  let sql = `SELECT o.*, c.name AS customer_name FROM orders o
             JOIN customers c ON o.customer_id = c.id`;
  const params = [];

  if (!isAdmin) {
    const [cust] = await db.query('SELECT id FROM customers WHERE user_id = ?', [req.user.id]);
    if (!cust.length) return res.json([]);
    sql += ' WHERE o.customer_id = ?';
    params.push(cust[0].id);
  }

  sql += ' ORDER BY o.created_at DESC';
  const [rows] = await db.query(sql, params);
  res.json(rows);
};

const getOrderById = async (req, res) => {
  const [orders] = await db.query(
    `SELECT o.*, c.name AS customer_name FROM orders o
     JOIN customers c ON o.customer_id = c.id WHERE o.id = ?`,
    [req.params.id]
  );
  if (!orders.length) return res.status(404).json({ message: 'Order not found' });

  const [items] = await db.query(
    `SELECT oi.*, p.name AS product_name FROM order_items oi
     JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?`,
    [req.params.id]
  );

  res.json({ ...orders[0], items });
};

const updateStatus = async (req, res) => {
  const { status, tracking_note } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ message: 'Invalid status' });

  const [result] = await db.query(
    'UPDATE orders SET status = ?, tracking_note = ? WHERE id = ?',
    [status, tracking_note, req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ message: 'Order not found' });
  res.json({ message: 'Order status updated' });
};

module.exports = { placeOrder, getOrders, getOrderById, updateStatus };
