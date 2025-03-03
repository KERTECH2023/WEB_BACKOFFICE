const mongoose  =require('mongoose')
const Schema  =mongoose.Schema
const { db2france } = require("../configbasefrance"); // Importer db2


const ContactSchema = new mongoose.Schema(
    {
       
        Nom: {
            type: String,
          
        },
        Prenom: {
            type: String,
          
        },
        Email: {
            type: String,
          
        },
        Cin: {
            type: String,
          
        },
      
        Message: {
            type: String,
          
        },
        Tel: {
            type: String,
          
        },
     
      
        status: {
            type: String,
            default: 'En cours'
            
        },

      
      
        isActive: {
            type: Boolean,
            default: true
            // select: false
        },

 
      
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        }
    },
     {timestamps: true},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
ContactSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        
    }
});

const Contact = db2france.model('Contact',ContactSchema)
module.exports = Contact