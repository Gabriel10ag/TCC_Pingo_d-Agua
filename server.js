const express = require('express');
const mercadopago = require('mercadopago');
const app = express();
const port = 3000;

// Configure o MercadoPago com seu access_token
mercadopago.configure({
  access_token: 'APP_USR-1921502923835686-091213-97c6f25f6625cd85c3d9cdf3191addb9-494550751'
});

app.use(express.json());

// Rota para criar uma preferência
app.post('/create_preference', async (req, res) => {
  try {
    let preference = {
      items: [
        {
          id: 'item-ID-1234',
          title: 'Meu produto',
          quantity: 1,
          unit_price: 75.76
        }
      ]
    };

    // Cria a preferência de pagamento
    const response = await mercadopago.preferences.create(preference);
    res.json({ id: response.body.id });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
