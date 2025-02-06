// models/Transfer.js

const mongoose = require('mongoose');

const TransferSchema = new mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String},
  email: { type: String},
  phone: { type: String },
  datevol: { type: String },
  heurvol: { type: String },
  numvol: { type: String },
  airport: { type: String },
  destination: { type: String },
  passengers: { type: String},
  price: { type: String },
  accepter: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', TransferSchema);
