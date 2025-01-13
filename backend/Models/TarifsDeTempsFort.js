const mongoose = require('mongoose');

const TarifsDeTempsFortSchema = new mongoose.Schema({
  startHour: {
    type: String,
 
  },
  endHour: {
    type: String,
   
  },
  baseFare: {
    type: Number,

  },
  farePerKm: {
    type: Number,

  },
  farePerMinute: {
    type: Number,
  },
});

module.exports = mongoose.model('TarifsDeTempsFort', TarifsDeTempsFortSchema);
