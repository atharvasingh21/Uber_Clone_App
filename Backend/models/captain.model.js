const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const captainSchema = new mongoose.Schema({
    fullname:{
        firstname:{
            type:String,
            required:true,
            minLength:[3, 'FirstName must be at least 3 characters long'],
        },
        lastname:{
            type:String,
            minLength: [3, "LastName must be at least 3 characters long"]
        }
    },
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase:true,
    },
    password:{
        type:String,
        required:true,
        select:false,
    },
    socketId:{
        type:String,
    },
    status:{
        type:String,
        enum: ['active', 'inactive'],
        default: 'inactive',
    },

    vehicle: {
        color:{
            type:String,
            require:true,
            minLength: [3, 'Color must be at least 3 characters long'],
        },
        plate:{
            type:String,
            require:true,
            minLength: [3, 'Plate must be at least 3 characters long'],
        },
        capacity:{
            type:Number,
            require:true,
            minLength: [3, 'Capacity must be at least 1'],
        },
        vehicleType: {
            type:String,
            require:true,
            enum: [ 'car', 'motorcycle', 'auto']
        },
        location:{
            ltd:{
                type:Number,
            },
            lng:{
                type:Number,
            }
        }

    }
})

captainSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({_id: this._id}, process.env.JWT_SECRET, {expiresIn: '24h'})
    return token;
}

captainSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

captainSchema.statics.hashPassword = async function (password) {
    return bcrypt.hash(password, 10);
}

// module.exports = mongoose.model('captain', captainSchema);
const captainModel = mongoose.model('captain', captainSchema);
module.exports = captainModel;