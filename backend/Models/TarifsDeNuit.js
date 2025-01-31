const mongoose = require('mongoose');

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

const Tarifsnuit = mongoose.model('Tarifnuit', tarifnuitSchema);

module.exports = Tarifsnuit;
