const db_uri = process.env.DB;
const mongoose = require('mongoose');
// mongoose.connect(db_uri, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(
  'mongodb+srv://admin:admin123@cluster0.5si5b.mongodb.net/Voip-node?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = mongoose;