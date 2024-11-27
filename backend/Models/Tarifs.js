const mongoose = require('mongoose');

const tarifSchema = new mongoose.Schema({
  
  baseFare: {
    type: String,
    required: true
  },
  farePerKm: {
    type: String,
    
  },
  farePerMinute: {
    type: String,
    
  },
  
  // Add other properties specific to your tariff model if needed
});
tarifSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      
  }
});

const Tarifs = mongoose.model('Tarif', tarifSchema);

module.exports = Tarifs;
