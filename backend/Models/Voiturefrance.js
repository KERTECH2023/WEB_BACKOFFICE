const mongoose  =require('mongoose')
const Schema  =mongoose.Schema
const validator = require('validator');
const { db2france } = require("../configbasefrance"); // Importer db2

const VoitSchema = new mongoose.Schema(
    {

    immatriculation: {
            type: String,
          
            
        },
        modelle: {
            type: String,
          
            
        },

        cartegrise: {
            type: String,
            
        },
        assurance: {
            type: String,
           
        },

        chauffeur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chauffeur"
        },


    }
    );



    VoitSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        
    }
});

const Voiture = db2france.model('Voiture',VoitSchema)
module.exports = Voiture
