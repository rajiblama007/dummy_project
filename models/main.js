const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const commentSchema = new Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment:{
        type: String,
        default: ''
    },
    author: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const bookingSchema = new Schema({
    booking:{
        type: Boolean,
        required: true
    },
    author: {
        type: String,
        required: true
    }
},{
    timestamps: true
});

const packageSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    destination: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    agency: {
        type: String,
        required: true
    },
    comments: [ commentSchema ],
    bookings: [ bookingSchema ]
},{
    timestamps: true
});

var Packages = mongoose.model('Package', packageSchema);

module.exports = Packages;