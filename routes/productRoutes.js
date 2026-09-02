const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(products.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST new product (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, price, description, category, image_url, stock } = req.body;
    const newProduct = await pool.query(
      'INSERT INTO products (name, price, description, category, image_url, stock) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, price, description, category, image_url, stock || 0]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update product inventory/details (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, image_url, stock } = req.body;
    
    const updatedProduct = await pool.query(
      'UPDATE products SET name=$1, price=$2, description=$3, category=$4, image_url=$5, stock=$6 WHERE id=$7 RETURNING *',
      [name, price, description, category, image_url, stock, id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(updatedProduct.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE product (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
