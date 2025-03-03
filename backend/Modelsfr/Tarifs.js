const mongoose = require('mongoose');
const { db2france } = require("../configbasefrance"); // Importer db2
const tarifSchema = new mongoose.Schema({
  
  baseFare: {
    type: Number,
    required: true
  },
  farePerKm: {
    type: Number,
    
  },
  farePerMinute: {
    type: Number,
    
  },
  FraisDeService: {
    type: Number,
    
  },
  percentage: {
    type: Number,
    
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

const Tarifs = db2france.model('Tarif', tarifSchema);

module.exports = Tarifs;
