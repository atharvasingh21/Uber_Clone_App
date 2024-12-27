const axios = require('axios');
require('dotenv').config();
const captainModel = require('../models/captain.model');


module.exports.getAddressCoordinate = async(address) => {
    const apikey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apikey}`;

    try{
        const response = await axios.get(url);
        console.log(response);
        if(response.data.status === 'OK'){
            const location = response.data.result[ 0 ].geometry.location;
            return {
                ltd: location.lat,
                lng: location.lng,
            };
        }else{
            throw new Error('Unable to fetch coordinates');
        }
    }catch(error){
        console.log("Error in catch Block");
        console.error(error);
        throw error;
    }
}

module.exports.getDistanceTime = async (origin, destination) => {
    if(!origin || !destination){
        throw new Error('Origin and Destination are required');
    }

    const apikey = process.env.GOOGLE_MAPS_API;

        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apikey}`;


    try{
        const response = await axios.get(url);
        if(response.data.status === 'OK'){
            if(response.data.row[ 0 ].elements[ 0 ].status === 'ZERO_RESULTS'){
                throw new Error('No routes found');
            }
            return response.data.rows[ 0 ].elements[ 0 ];
        }else{
            throw new Error('Unable to fetch distance and time');
        }
    }catch(error){
        console.log(error);
        throw error;
    }
}

module.exports.getAutoCompleteSuggestions = async(input) => {
    if(!input){
        throw new Error('query is required');
    }

    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`

    try{
        const response = await axios.get(url);
        if(response.data.status === 'OK'){
            return response.data.predictions;
        }else{
            throw new Error('Unable to fetch suggestions');
        }
    }catch(err){
        console.error(err);
        throw err;
    }
}

module.exports.getCaptainsInTheRadius = async(ltd, lng, radius) => {
    // Radius in Km
    const captains = await captainModel.find({
        location:{
            $geoWithin: {
                $centerSphere: [ [ltd, lng], radius / 6371]
            }
        }
    });
    return captains;
}