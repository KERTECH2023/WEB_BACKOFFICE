const mongoose  =require('mongoose')
const Schema  =mongoose.Schema
const validator = require('validator');

const ClientSchema = new mongoose.Schema(
    {

        username: {
            type: String,
            unique: true
          },
       
        Nom: {
            type: String,
            trim: true,
           
        },
        Prenom: {
            type: String,
            trim: true,
            
        },
        email: {
            type: String,
            required: [true, 'Please provide your email'],
            unique: true,
            lowercase: true,
            validate: [validator.isEmail, 'Please provide a valid email']
        },
        phone: {
            type: String,
            // required: [true, 'Please provide your phone'],
            // minlength: 8,
            unique: true
        },
        password: {
            type: String,
            required: [true, 'Please provide a password'],
            select: false
        },
        DateNaissance: {
            type: Date,
            required: [true, 'Please provide a DateNaissance'],
           
        },
        gender: {
            type: String,
            enum: {
                values: ['male', 'female','-'],
                message: '{VALUE} is not supported'
                
            },
            default: '-'
            
        },
        role: {
            type: String,
        
        },

        Nationalite: {
            type: String,
            trim: true,
            required: [true, 'Please provide a Nationalite'],
            default: '-'
        },
        photoAvatar: {
            type: String,
          
        },
          cnicNo: {
            type: String,
            required: [true, "Please provide a cnic."],
            unique: true
          },
        

          address: {
            type: String,
            trim: true,
            required: [true, "Please provide an address"],
          },
          
          ratingsAverage: {
            type: Number,
            default: 1,
            min: [1, "Rating must be above 1.0"],
            max: [5, "Rating must be below 5.0"],
            set: (val) => Math.round(val * 10) / 10, // 4.666666, 46.6666, 47, 4.7
            
          },

          ratingsQuantity: {
            type: Number,
            default: 0,
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
ClientSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        delete ret._id;
        
    }
});

const Client = mongoose.model('Client',ClientSchema)
module.exports = Client
