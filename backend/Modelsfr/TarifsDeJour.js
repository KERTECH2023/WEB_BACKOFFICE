const mongoose = require('mongoose');
const { db2france } = require("../configbasefrance"); // Importer db2
const tarifjourSchema = new mongoose.Schema({
  
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
tarifjourSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      
  }
});

const Tarifsjour = db2france.model('Tarifjour', tarifjourSchema);

module.exports = Tarifsjour;
