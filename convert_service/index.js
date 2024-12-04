const express = require('express');
const app = express();
const axios = require('axios')
const port = 9090;
const https = require('https');

const fs = require('fs');

const cors=require('cors');
app.use(cors());



app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('servidor activo');
});

app.get('/convert', async (req, res) => {
  const { from_currency, to_currency, amount } = req.query;

  if (!from_currency || !to_currency || !amount) {
    return res.status(400).json({ error: 'Los parámetros from_currency, to_currency y amount son necesarios.' });
  }

  const amountNumber = parseFloat(amount);
  if (isNaN(amountNumber)) {
    return res.status(400).json({ error: 'El parámetro amount debe ser un número válido.' });
  }

  try {
    //const response = await axios.get('http://convertidor-rates-1:8080/rates');
    const response = await axios.get('http://redesfn.duckdns.org/rates');
    const rates = response.data;

    const rateFrom = rates[from_currency.toUpperCase()];
    const rateTo = rates[to_currency.toUpperCase()];

    console.log({rateFrom,rateTo})

    if (!rateFrom || !rateTo) {
      return res.status(400).json({ error: 'Una o ambas monedas no existen en los datos de tasas de cambio.' });
    }

    const exchangeRate = rateTo / rateFrom;
    console.log({exchangeRate})
    const convertedAmount = amount * exchangeRate;
    console.log({convertedAmount})


    res.json({
      original_amount: amount,
      converted_amount: convertedAmount,
      exchange_rate: exchangeRate,
      from_currency: from_currency.toUpperCase(),
      to_currency: to_currency.toUpperCase(),
    });
  } catch (error) {
    console.error('Error al obtener las tasas de cambio:', error);
    res.status(500).json({ error: 'Error al obtener las tasas de cambio' });
  }
});

const option = {
    key : fs.readFileSync('./privkey.pem'),
    cert : fs.readFileSync('./fullchain.pem')
};

//const key = fs.readFileSync('./key.pem');
//const cert = fs.readFileSync('./cert.pem');
// Iniciar el servidor
app.listen(port, () => {
  console.log('Servidor escuchando en puerto: '+ port);
});
//https.createServer(option, app).listen(9090, () => {
  //console.log('Servidor HTTPS corriendo en el puerto 9090');
//});
