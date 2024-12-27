const express = require('express');
const router = express.Router();
const {body, query} = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().isLength({min: 3}).withMessage('Invalid Pickup Address'),
    body('destination').isString().isLength({min:3}).withMessage('Invalid Destination address'),
    body('vehicleType').isString().isIn(['auto', 'car', 'motorcycle']).withMessage('Invalid Vehicle Type'),
    rideController.createRide
)

router.get('/get-fare', 
    authMiddleware.authUser,
    query('pickup').isString().isLength({min:3}).withMessage('Invalid Pickup'),
    query('destination').isString().isLength({min:3}).withMessage('Invalid Destination'),
    rideController.getFare
)

router.post('/confirm',
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid Ride Id'),
    body('otp').isString().isLength({min:6, max: 6 }).withMessage('invalid Otp'),
    rideController.confirmRide
)

router.get('/start-ride', 
    authMiddleware.authCaptain,
    query('rideid').isMongoId().withMessage('Invalid Ride Id'),
    query('otp').isString().isLength({min:6, max: 6}).withMessage('Invalid Otp'),
    rideController.startRide
)

router.get('/end-ride', 
    authMiddleware.authCaptain,
    body('rideId').isMongoId().withMessage('Invalid ride id'),
    rideController.endRide
)

module.exports = router;