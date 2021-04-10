const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Packages = require('../models/main');

const agencyPackageRouter = express.Router();

agencyPackageRouter.use(bodyParser.json());
agencyPackageRouter.route('/')
    .get((req, res, next) => {
        Packages.find({agency: req.body.agency})
            .then((packages) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(packages);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })

module.exports = agencyPackageRouter;