const mongoose = require('mongoose');

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

const Tariftempfort = mongoose.model('Tariftempfort', tariftempfortSchema);

module.exports = Tariftempfort;
