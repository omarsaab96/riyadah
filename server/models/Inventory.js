const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  club: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // assuming club is a User of type "Club"
  itemName: { type: String, required: true },
  category: { type: String, enum: ['Equipment', 'Sportswear', 'Jersey', 'Accessories', 'Other'], default: 'Other' },
  quantity: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 }, // optional, price per unit
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);
