const rideModel = require('../models/ride.model');
const mapService = require('../services/maps.service');
const crypto = require('crypto');
const { sendMessageToSocketId } = require('../socket');


async function getFare(pickup, destination){
    if(!pickup || !destination){
        throw new Error('Pickup and Destination are required');
    }

    const distanceTime = await mapService.getDistanceTime(pickup, destination);

    const baseFare = {
        auto:30,
        car:50,
        motorcycle:20,
    };

    const perKmRate = {
        auto:10,
        car:15,
        motorcycle: 8
    };

    const perMinutesRate = {
        auto:2,
        car:3,
        motorcycle: 1.5
    };

    const fare = {
        auto:Math.round(baseFare.auto + ((distanceTime.distance.value/1000) * perKmRate.auto) + ((distanceTime.duration.value/60) * perMinutesRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value/1000) * perKmRate.car) + ((distanceTime.duration.value/60) * perMinutesRate.auto)),
        motorcycle: Math.round(baseFare.motorcycle + ((distanceTime.distance.value/1000) * perKmRate.motorcycle) + ((distanceTime.duration.value/60) * perMinutesRate.motorcycle)),
    };
    return fare;
}

module.exports.getFare = getFare;

function getOtp(num) {
    function generateOtp(num){
        const otp = crypto.randomInt(Math.pow(10, num-1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}

module.exports.createRide = async({user, pickup, destination, vehicleType}) => {
    if(!user || !destination || !pickup || !vehicleType){
        throw new Error('All Fields are required');
    }

    const fare = await getFare(pickup, destination);


    const ride = rideModel.create({
        user,
        pickup,
        destination,
        otp: getOtp(6),
        fare: fare[vehicleType]
    })

    return ride;
}

module.exports.confirmRide = async({rideId, captain}) => {
    if(!rideId){
        throw new Error('Ride id is Required');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId
    },{
        status: 'Accepted',
        captain: captain._id
    });

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').select('+otp');

    if(!ride){
        throw new Error('Ride Not Found');
    }
    
    return ride;
}
    
module.exports.startRide = async({rideId, otp, captain}) => {
    if(!rideId || !otp){
        throw new Error('Ride id and Otp are Required');
    }

    const ride = await rideModel.findOne({
        _id: rideId
    }).populate('user').populate('captain').populate('+otp');

    if(!ride){
        throw new Error('Ride not found');
    }

    if(ride.status !== 'accepted'){
        throw new Error('Ride Not Accepted');
    }

    if(ride.otp !== otp){
        throw new Error('Invalid OTP');
    }

    await rideModel.findByIdAndUpdate({
        _id: rideId, 
    }, {
        status: 'ongoing'
    });

    sendMessageToSocketId(ride.user.socketid, {
        event: 'ride-started',
        data: ride
    });
    return ride;
}

module.exports.endRide = async({rideId, captain}) => {
    if(!rideId){
        throw new Error('Ride id is required');
    }

    const ride = await rideModel.findOne({
        _id: rideId,
        captain: captain._id
    }).populate('user').populate('captain').select('+otp');

    if(!ride){
        throw new Error('Ride Not Found');
    }

    if(ride.status !== 'ongoing'){
        throw new Error('Ride not ongoing');
    }

    await rideModel.findOneAndUpdate({
        _id: rideId,
    },{
        status: 'completed'
    })
    return ride;
}