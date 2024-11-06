// index.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs'); // Set view engine to EJS
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection URI and schema 
// const MONGO_URI = 'mongodb://localhost:27017/cryptoDB';
// const MONGO_URI="mongodb+srv://new_user:044outkQcYXdpFRA@cluster1.iw3lm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";
// const MONGO_URI = "mongodb+srv://new_user:044outkQcYXdpFRA@cluster1.iw3lm.mongodb.net/crypto-app?retryWrites=true&w=majority";

const MONGO_URI="mongodb://new_user:044outkQcYXdpFRA@cluster1-shard-00-00.iw3lm.mongodb.net:27017,cluster1-shard-00-01.iw3lm.mongodb.net:27017,cluster1-shard-00-02.iw3lm.mongodb.net:27017/?ssl=true&replicaSet=atlas-v86fqn-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster1";

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const cryptoSchema = new mongoose.Schema({
  name: String,
  last: Number,
  low:Number,
  high:Number,
  at:Number,
  open:Number,
  buy: Number,
  sell: Number,
  volume: Number,
  base_unit: String,
});

const Crypto = mongoose.model('Crypto', cryptoSchema);

// Route to render home page with "Fetch Data" button
app.get('/', (req, res) => {
  res.render('index');
});

// Route to fetch and save top 10 results to MongoDB
app.get('/fetch-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.wazirx.com/api/v2/tickers');
    const data = Object.values(response.data).slice(0, 10);

    const cryptoData = data.map(item => ({
      name: item.name,
      last: item.last,
      buy: item.buy,
      sell: item.sell,
      low:item.low,
      high:item.high,
      at:item.at,
      open:item.open,
      volume: item.volume,
      base_unit: item.base_unit,
    }));

    await Crypto.deleteMany({});
    await Crypto.insertMany(cryptoData);

    res.redirect('/crypto-data');
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data.');
  }
});

// Route to display the stored data on the front end
app.get('/crypto-data', async (req, res) => {
  try {
    const cryptoData = await Crypto.find({});
    res.render('crypto-data', { cryptoData });
  } catch (error) {
    console.error('Error fetching stored data:', error);
    res.status(500).send('Error fetching stored data.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
