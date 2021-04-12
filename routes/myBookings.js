const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const User = require('../models/user');
var authenticate = require('../authenticate');

const myBookings = express.Router();

myBookings.use(bodyParser.json());
myBookings.route('/')
    .get(authenticate.verifyUser, (req, res, next) => {
        User.findById(req.user._id)
        .populate('myBookings')
            .then((user) => {
                if(user != null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(user.myBookings);
                }
                else {
                    err = new Error('user not found!');
                    err.status = 400;
                    return next(err);
                }
            },
            (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = myBookings;