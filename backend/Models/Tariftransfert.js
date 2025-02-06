const mongoose = require('mongoose');

const tarifTransfertSchema = new mongoose.Schema({
  
  prixdepersonne: {
    type: Number,
    required: true
  },
  prixdebase: {
    type: Number,
    
  },
 
  
  // Add other properties specific to your tariff model if needed
});
tarifTransfertSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
      delete ret._id;
      
  }
});

const tarifTransfert = mongoose.model('tarifTransfert', tarifTransfertSchema);

module.exports = tarifTransfert;
