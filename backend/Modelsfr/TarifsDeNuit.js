const mongoose = require('mongoose');
const { db2france } = require("../configbasefrance"); // Importer db2
const tarifnuitSchema = new mongoose.Schema({
  
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
  
  // Add other properties specific to your tarifnuitf model if needed
});
tarifnuitSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      
  }
});

const Tarifsnuit = db2france.model('Tarifnuit', tarifnuitSchema);

module.exports = Tarifsnuit;
