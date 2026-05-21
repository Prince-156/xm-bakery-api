const db = require('../config/db');

const salesReport = async (req, res) => {
  const { from, to } = req.query;
  let sql = `SELECT DATE(o.created_at) AS date,
               COUNT(DISTINCT o.id) AS total_orders,
               SUM(o.total_amount) AS total_revenue,
               SUM(oi.quantity) AS total_items_sold
             FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             WHERE o.status != 'cancelled'`;
  const params = [];
  if (from) { sql += ' AND DATE(o.created_at) >= ?'; params.push(from); }
  if (to) { sql += ' AND DATE(o.created_at) <= ?'; params.push(to); }
  sql += ' GROUP BY DATE(o.created_at) ORDER BY date DESC';

  const [rows] = await db.query(sql, params);
  res.json(rows);
};

const inventoryReport = async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, c.name AS category, p.price, p.quantity,
            (p.price * p.quantity) AS stock_value,
            CASE WHEN p.quantity = 0 THEN 'Out of Stock'
                 WHEN p.quantity < 10 THEN 'Low Stock'
                 ELSE 'In Stock' END AS stock_status
     FROM products p LEFT JOIN categories c ON p.category_id = c.id
     ORDER BY p.quantity ASC`
  );
  res.json(rows);
};

const topProducts = async (req, res) => {
  const [rows] = await db.query(
    `SELECT p.id, p.name, SUM(oi.quantity) AS total_sold, SUM(oi.quantity * oi.unit_price) AS revenue
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     JOIN orders o ON oi.order_id = o.id
     WHERE o.status != 'cancelled'
     GROUP BY p.id, p.name
     ORDER BY total_sold DESC LIMIT 10`
  );
  res.json(rows);
};

module.exports = { salesReport, inventoryReport, topProducts };
