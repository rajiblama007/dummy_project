const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Packages = require('../models/main');

const packageRouter = express.Router();

packageRouter.use(bodyParser.json());

packageRouter.route('/')
    .get((req, res, next) => {
        Packages.find({})
            .then((packages) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(packages);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Packages.create(req.body)
            .then((package) => {
                console.log('Book created: ', package);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(package);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /packages');
    })
    .delete((req, res, next) => {
        Packages.remove({})
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            },
            (err) => next(err))
            .catch((err) => next(err));
    });

packageRouter.route('/:packageId')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(package);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /package/' + req.params.packageId);
    })
    .put((req, res, next) => {
        Packages.findByIdAndUpdate(req.params.packageId, {
            $set: req.body
        }, {
            new: true})
            .then((package) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(package);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Packages.findByIdAndRemove(req.params.packageId)
            .then((resp) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(resp);
            },
            (err) => next(err))
            .catch((err) => next(err));
    });

// PACKAGE BOOKING CODE
packageRouter.route('/:packageId/bookings')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if(package != null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(package.bookings);
                }
                else {
                    err = new Error('package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null){
                    //package.sellers.push(req.body); // @pushall method not supported mongo 3.5 and above version, yo method deprecated gardeko xa
                    package.bookings = package.bookings.concat([req.body]); // So, use concat method instead.
                    package.save()
                        .then((package) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(package);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Book' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            },(err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /packages/'
            + req.params.packageId + '/bookings');
    })
    .delete((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null){
                    for (var i = (package.bookings.length -1); i>= 0; i--){
                        package.bookings.id(package.bookings[i]._id).remove();
                    }
                    package.save()
                        .then((package) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(package);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            },(err) => next(err))
            .catch((err) => next(err));
    });

packageRouter.route('/:packageId/bookings/:bookingId')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null && package.bookings.id(req.params.bookingId) != null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(package.bookings.id(req.params.bookingId));
                }
                else if ( package == null ){
                    err = new Error('package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
                else {
                    err = new Error('Booking' + req.params.bookingId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /packages/' + req.params.packageId
            + '/sellers/' + req.params.bookingId);
    })
    .put((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null && package.bookings.id(req.params.bookingId) != null) {
                    if (req.body.price) {
                        package.bookings.id(req.params.bookingId).price = req.body.price;
                    }
                    package.save()
                        .then((package) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(package);
                        }, (err) => next(err));
                }
                else if (package == null) {
                    err = new Error('package ' + req.params.packageId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('Booking ' + req.params.bookingId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Packages.findById(req.params.packageId)
        .then((package) => {
            if(package != null && package.bookings.id(req.params.bookingId) != null){
                package.bookings.id(req.params.bookingId).remove();
                package.save()
                    .then((package) => {        
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(package);
                    }, (err) = next(err))
                    .catch((err) => next(err));
            }
            else if ( package == null ){
                err = new Error('package' + req.params.packageId + ' not found!');
                err.status = 400;
                return next(err);
            }
            else {
                err = new Error('Booking' + req.params.bookingId + ' not found!');
                err.status = 400;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });

// PACKAGE COMMENTS CODE

packageRouter.route('/:packageId/:comments')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if(package != null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(package.comments);
                }
                else {
                    err = new Error('package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null){
                    //package.sellers.push(req.body); // @pushall method not supported mongo 3.5 and above version, yo method deprecated gardeko xa
                    package.comments = package.comments.concat([req.body]); // So, use concat method instead.
                    package.save()
                        .then((package) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(package);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('Package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            },(err) => next(err))
            .catch((err) => next(err));
    })
    .put((req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /packages/'
            + req.params.packageId + '/comments');
    })
    .delete((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null){
                    for (var i = (package.comments.length -1); i>= 0; i--){
                        package.comments.id(package.comments[i]._id).remove();
                    }
                    package.save()
                        .then((package) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(package);
                        }, (err) => next(err));
                }
                else {
                    err = new Error('package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            },(err) => next(err))
            .catch((err) => next(err));
    });

packageRouter.route('/:packageId/comments/commentId')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if(package != null && package.comments.id(req.params.commentId) != null){
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(package.comments.id(req.params.commentId));
                }
                else if ( package == null ){
                    err = new Error('package' + req.params.packageId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
                else {
                    err = new Error('comment' + req.params.commentId + ' not found!');
                    err.status = 400;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .post((req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /packages/' + req.params.packageId
            + '/comments/' + req.params.commentId);
    })
    .put((req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null && package.comments.id(req.params.commentId) != null) {
                    if (req.body.price) {
                        package.comments.id(req.params.commentId).price = req.body.price;
                    }
                    package.save()
                        .then((package) => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(package);
                        }, (err) => next(err));
                }
                else if (package == null) {
                    err = new Error('package ' + req.params.packageId + ' not found');
                    err.status = 404;
                    return next(err);
                }
                else {
                    err = new Error('comment ' + req.params.commentId + ' not found');
                    err.status = 404;
                    return next(err);
                }
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete((req, res, next) => {
        Packages.findById(req.params.packageId)
        .then((package) => {
            if(package != null && package.comments.id(req.params.commentId) != null){
                package.comments.id(req.params.commentId).remove();
                package.save()
                    .then((package) => {        
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(package);
                    }, (err) = next(err))
                    .catch((err) => next(err));
            }
            else if ( package == null ){
                err = new Error('package' + req.params.packageId + ' not found!');
                err.status = 400;
                return next(err);
            }
            else {
                err = new Error('comment' + req.params.commentId + ' not found!');
                err.status = 400;
                return next(err);
            }
        }, (err) => next(err))
        .catch((err) => next(err));
    });


module.exports = packageRouter;