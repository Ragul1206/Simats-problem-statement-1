const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

exports.getInventoryProducts = (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products ORDER BY name ASC').all();
    const transactions = db.prepare(`
      SELECT it.*, p.name as product_name, p.sku as product_sku
      FROM inventory_transactions it
      JOIN products p ON it.product_id = p.id
      ORDER BY it.created_at DESC LIMIT 20
    `).all();

    res.json({ products, transactions });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to retrieve inventory products' });
  }
};

exports.receiveGoodsForPO = (req, res) => {
  try {
    const { po_id, quantity_received, notes } = req.body;

    if (!po_id || !quantity_received) {
      return res.status(400).json({ error: 'PO ID and Quantity Received are required' });
    }

    const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(po_id);
    if (!po) {
      return res.status(404).json({ error: 'Purchase Order not found' });
    }

    const qty = parseInt(quantity_received);

    // Update Product Stock Levels
    db.prepare(`
      UPDATE products 
      SET stock_quantity = stock_quantity + ?,
          incoming_stock = MAX(0, incoming_stock - ?)
      WHERE id = ?
    `).run(qty, qty, po.product_id);

    // Update PO Status to Fulfilled if all units received
    db.prepare("UPDATE purchase_orders SET status = 'Fulfilled' WHERE id = ?").run(po_id);

    // Record Inventory Transaction
    const txId = 'txn-' + uuidv4().substring(0, 8);
    db.prepare(`
      INSERT INTO inventory_transactions (id, product_id, transaction_type, quantity, po_id, notes, created_by)
      VALUES (?, ?, 'RECEIVED', ?, ?, ?, ?)
    `).run(txId, po.product_id, qty, po_id, notes || 'Goods Received Note (GRN) against PO ' + po.po_number, req.user.name);

    res.json({ message: `Successfully received ${qty} units against ${po.po_number}. Stock updated.` });
  } catch (error) {
    console.error('Error receiving goods:', error);
    res.status(500).json({ error: 'Failed to receive goods' });
  }
};
