const mongoose = require('mongoose');
const { db2france } = require("../configbasefrance"); // Importer db2
const tariftempfortSchema = new mongoose.Schema({
  
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
  
  // Add other properties specific to your tarifjourf model if needed
});
tariftempfortSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      
  }
});

const Tariftempfort = db2france.model('Tariftempfort', tariftempfortSchema);

module.exports = Tariftempfort;
