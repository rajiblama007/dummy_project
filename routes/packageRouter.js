const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const Packages = require('../models/main');
var authenticate = require('../authenticate');

const packageRouter = express.Router();

packageRouter.use(bodyParser.json());

packageRouter.route('/')
    .get((req, res, next) => {
        Packages.find({})
        .populate('comments.author')
        .populate('bookings.author')
        .populate('agency')
            .then((packages) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(packages);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })
    // .post(authenticate.verifyUser, authenticate.verifyAgency ,(req, res, next) => {
    //     Packages.create(req.body)
    //         .then((package) => {
    //             if(package != null){
    //                 req.body.agency = req.user._id;
    //                 package.save()
    //                 .then((package) => {
    //                     console.log('Book created: ', package);
    //                     res.statusCode = 200;
    //                     res.setHeader('Content-Type', 'application/json');
    //                     res.json(package);
    //                 }, (err) => next(err));
    //             }
    //         },
    //         (err) => next(err))
    //         .catch((err) => next(err));
    // })
    .post(authenticate.verifyUser, authenticate.verifyAgency, (req, res, next) => {
        req.body.agency = req.user._id;
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
    .put(authenticate.verifyUser, authenticate.verifyAgency, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /packages');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
        .populate('comments.author')
        .populate('bookings.author')
        .populate('agency')
            .then((package) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(package);
            },
            (err) => next(err))
            .catch((err) => next(err));
    })
    .post(authenticate.verifyUser, authenticate.verifyAgency, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /package/' + req.params.packageId);
    })
    .put(authenticate.verifyUser, authenticate.verifyAgency, (req, res, next) => {
        Packages.findById(req.params.packageId)
        .then((package) => {
            if (package != null
                && package.agency.equals(req.user._id)){
                if(req.body.name) {
                    package.name = req.body.name;
                }
                if(req.body.price) {
                    package.price = req.body.price;
                }
                if(req.body.destination) {
                    package.destination = req.body.destination;
                }
                if(req.body.iternaries) {
                    package.iternaries = req.body.iternaries;
                }
                if(req.body.included) {
                    package.included = req.body.included;
                }
                if(req.body.excluded) {
                    package.excluded = req.body.excluded;
                }
                if(req.body.phone) {
                    package.phone = req.body.phone;
                }
                if(req.body.email) {
                    package.email = req.body.email;
                }
                if(req.body.description) {
                    package.description = req.body.description;
                }
                package.save()
                .then((package) => {
                    Packages.findById(package._id)
                    .populate('agency')
                    .then((package) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(package);  
                    })
                }, (err) => next(err))
            }
            else {
                res.statusCode = 403;
                res.end('You are not authorized');
            }
        }, (err) => next(err))
    })
    .delete(authenticate.verifyUser, authenticate.verifyAgency, (req, res, next) => {

        Packages.findById(req.params.packageId)
        .then((package) => {
            if (package != null 
                && package.agency.equals(req.user._id)){
                    package.remove();
                    package.save()
                    .then((resp) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(resp);
                    })
                }
            else if (package == null){
                err = new Error('package' + req.params.packageId + ' not found!');
                err.status = 400;
                return next(err);
            }
            else {
                res.statusCode = 403;
                res.end('You are not authorized');
            }
         }, (err) => next(err))
         .catch((err) => next(err));
    });

// PACKAGE BOOKING CODE
packageRouter.route('/:packageId/bookings')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
        .populate('bookings.author')
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
    .post(authenticate.verifyUser, (req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null){
                    req.body.author = req.user._id;
                    //package.sellers.push(req.body); // @pushall method not supported mongo 3.5 and above version, yo method deprecated gardeko xa
                    package.bookings = package.bookings.concat([req.body]); // So, use concat method instead.
                    package.save()
                        .then((package) => {
                            Packages.findById(package._id)
                            .then((package) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(package);
                            })
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
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /packages/'
            + req.params.packageId + '/bookings');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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
        .populate('bookings.author')
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
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /packages/' + req.params.packageId
            + '/sellers/' + req.params.bookingId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null && package.bookings.id(req.params.bookingId) != null
                && package.bookings.id(req.params.bookingId).author.equals(req.user._id)) {
                    if (req.body.booking) {
                        package.bookings.id(req.params.bookingId).booking = req.body.booking;
                    }
                    if (req.body.peopleCount) {
                        package.bookings.id(req.params.bookingId).peopleCount = req.body.peopleCount;
                    }
                    package.save()
                        .then((package) => {
                            Packages.findById(package._id)
                            .populate('bookings.author')
                            .then((package) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(package);
                            })
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
    .delete(authenticate.verifyUser, (req, res, next) => {
        Packages.findById(req.params.packageId)
        .then((package) => {
            if(package != null && package.bookings.id(req.params.bookingId) != null
            && package.bookings.id(req.params.bookingId).author.equals(req.user._id)){
                package.bookings.id(req.params.bookingId).remove();
                package.save()
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                })
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

packageRouter.route('/:packageId/comments')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
        .populate('comments.author')
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
    .post(authenticate.verifyUser, (req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null){
                    req.body.author = req.user._id;
                    //package.sellers.push(req.body); // @pushall method not supported mongo 3.5 and above version, yo method deprecated gardeko xa
                    package.comments = package.comments.concat([req.body]); // So, use concat method instead.
                    package.save()
                        .then((package) => {
                            Packages.findById(package._id)
                            .then((package) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(package);
                            })
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
    .put(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /packages/'
            + req.params.packageId + '/comments');
    })
    .delete(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
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

packageRouter.route('/:packageId/comments/:commentId')
    .get((req, res, next) => {
        Packages.findById(req.params.packageId)
        .populate('comments.author')
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
    .post(authenticate.verifyUser, (req, res, next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /packages/' + req.params.packageId
            + '/comments/' + req.params.commentId);
    })
    .put(authenticate.verifyUser, (req, res, next) => {
        Packages.findById(req.params.packageId)
            .then((package) => {
                if (package != null && package.comments.id(req.params.commentId) != null
                && package.comments.id(req.params.commentId).author.equals(req.user._id)) {
                    if (req.body.comment) {
                        package.comments.id(req.params.commentId).comment = req.body.comment;
                    }
                    if (req.body.rating) {
                        package.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    package.save()
                        .then((package) => {
                            Packages.findById(package._id)
                            .populate('comments.author')
                            .then((package) => {
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json(package);
                            })
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
    .delete(authenticate.verifyUser, (req, res, next) => {
        Packages.findById(req.params.packageId)
        .then((package) => {
            if(package != null && package.comments.id(req.params.commentId) != null
            && package.comments.id(req.params.commentId).author.equals(req.user._id)){
                package.comments.id(req.params.commentId).remove();
                package.save()
                .then((resp) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(resp);
                })
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