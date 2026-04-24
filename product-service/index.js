const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool, runMigrations } = require('./database');
const authMiddleware = require('./authMiddleware');

const app = express();
app.use(express.json());

runMigrations();

app.use((req, res, next) => {
  const correlationId = req.headers['x-correlation-id'] || uuidv4();
  req.correlationId = correlationId;
  
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "INFO",
    message: `Requisição recebida: ${req.method} ${req.url}`,
    correlationId: req.correlationId,
    service: "product-service"
  }));
  
  res.setHeader('x-correlation-id', correlationId);
  next();
});

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: "UP", 
      service: "product-service",
      database: "connected", 
      correlationId: req.correlationId 
    });
  } catch (err) {
    res.status(503).json({ 
      status: "DOWN", 
      correlationId: req.correlationId 
    });
  }
});

app.use(authMiddleware);

app.get('/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, s.quantity 
      FROM products p 
      LEFT JOIN stock s ON p.id = s.product_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(JSON.stringify({ level: "ERROR", correlationId: req.correlationId, error: err.message }));
    res.status(500).json({ error: "Erro ao buscar produtos", correlationId: req.correlationId });
  }
});

app.post('/products', async (req, res) => {
  const { name, description, price, category, quantity } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const productRes = await client.query(
      'INSERT INTO products (name, description, price, category) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, description, price, category]
    );
    
    const productId = productRes.rows[0].id;
    
    await client.query(
      'INSERT INTO stock (product_id, quantity) VALUES ($1, $2)',
      [productId, quantity || 0]
    );
    
    await client.query('COMMIT');
    
    console.log(JSON.stringify({
      level: "INFO",
      message: "Produto criado com sucesso",
      productId: productId,
      correlationId: req.correlationId
    }));

    res.status(201).json({ id: productId, correlationId: req.correlationId });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(JSON.stringify({ level: "ERROR", correlationId: req.correlationId, error: err.message }));
    res.status(500).json({ error: err.message, correlationId: req.correlationId });
  } finally {
    client.release();
  }
});

app.patch('/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { quantityChange } = req.body; 

  if (quantityChange === undefined) {
    return res.status(400).json({ error: "quantityChange é obrigatório", correlationId: req.correlationId });
  }

  try {
    const result = await pool.query(
      'UPDATE stock SET quantity = quantity + $1 WHERE product_id = $2 RETURNING quantity',
      [quantityChange, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Produto não encontrado no estoque", correlationId: req.correlationId });
    }
    
    console.log(JSON.stringify({
      level: "INFO",
      message: "Estoque atualizado",
      productId: id,
      newQuantity: result.rows[0].quantity,
      correlationId: req.correlationId
    }));

    res.json({ 
      message: "Estoque atualizado com sucesso", 
      newQuantity: result.rows[0].quantity,
      correlationId: req.correlationId 
    });
  } catch (err) {
    console.error(JSON.stringify({ level: "ERROR", correlationId: req.correlationId, error: err.message }));
    res.status(500).json({ error: "Erro ao atualizar estoque", correlationId: req.correlationId });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Product Service rodando na porta ${PORT}`);
});