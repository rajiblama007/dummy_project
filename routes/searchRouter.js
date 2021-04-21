const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Packages = require('../models/main');

const searchRouter = express.Router();

searchRouter.use(bodyParser.json());
searchRouter.route('/')
    .post((req, res, next) => {
        Packages.find({destination: req.body.destination})
            .then((packages) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(packages);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = searchRouter;