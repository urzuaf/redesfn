const express = require('express');
const fs = require('fs');
const app = express();
const port = 8080;

const apikey = "0ea772fdefcc5b0508652ab6"
const cors = require('cors');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  const filePath = './messages.json';  
    res.status(200).send('servidor activo123');
});

async function getExchangeData() {
  try {
    const response = await fetch('https://v6.exchangerate-api.com/v6/0ea772fdefcc5b0508652ab6/latest/USD');
    const data = await response.json();
    const filePath = './rates.json';  
    fs.writeFileSync(filePath, JSON.stringify(data.conversion_rates, null, 2));
  } catch (error) {
    console.error('Error al obtener los datos de la API:', error);
    return null;
  }
}


app.get('/Lrates', (req, res) => {
  const filePath = './rates.json';
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    res.json(JSON.parse(data));
  } else {
    res.status(404).send('Archivo no encontrado');
  }
});

app.get('/rates', (req, res) => {
  const filePath = './rates.json';
  
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath));
    const { from, to } = req.query;

    console.log({from,to})

    if (from && to) {
      const rateFrom = data[from.toUpperCase()];
      const rateTo = data[to.toUpperCase()];

      if (rateFrom && rateTo) {
        const exchangeRate = rateTo / rateFrom;
        res.json({ from, to, rate: exchangeRate });
      } else {
        res.status(400).json({ error: 'Una o ambas monedas no existen en los datos' });
      }
    } else {
      res.json(data);
    }
  } else {
    res.status(404).send('Archivo no encontrado');
  }
});



setInterval(() => {
   getExchangeData(); 
}, 1000 * 60 * 60 * 24);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
  getExchangeData()
});
