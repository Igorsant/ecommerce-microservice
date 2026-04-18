const express = require('express');
const knex = require('knex')(require('./knexfile'));
const app = express();

app.use(express.json());

app.use(function(req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || 'req-' + Date.now();
  req.correlationId = correlationId;
  next();
});

app.get('/health', function(req, res) {
  res.status(200).json({ 
    status: 'UP', 
    service: 'payment-service', 
    timestamp: new Date() 
  });
});

app.post('/payments', async function(req, res) {
  const orderId = req.body.order_id;
  const amount = req.body.amount;
  
  console.log('{"level": "INFO", "correlationId": "' + req.correlationId + '", "message": "Processando pagamento para a ordem ' + orderId + '", "amount": ' + amount + '}');
  
  try {
    const [pagamentoSalvo] = await knex('payments').insert({
      order_id: orderId,
      amount: amount
    }).returning(['id', 'order_id', 'status', 'amount', 'created_at']);
    
    res.status(201).json(pagamentoSalvo);
    
  } catch (erro) {
    console.error('{"level": "ERROR", "correlationId": "' + req.correlationId + '", "message": "Falha ao salvar no banco de dados"}');
    res.status(500).json({ error: 'Erro interno ao processar pagamento' });
  }
});

const port = process.env.PORT || 3005;

app.listen(port, function() {
  console.log('{"level": "INFO", "message": "Payment Service ativo na porta ' + port + '"}');
});