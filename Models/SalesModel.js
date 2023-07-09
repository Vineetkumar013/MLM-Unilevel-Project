const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  distributor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  order:{type:mongoose.Schema.Types.ObjectId, ref: 'Order'},
  amount: Number,
  bv: Number
});

const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;