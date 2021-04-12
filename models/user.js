var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    admin:   {
        type: Boolean,
        default: false
    },
    agency: {
        type: Boolean,
        default: false
    },
    myBookings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package'
    }]
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);