const userModel = require("../models/user.model");


module.exports.createUser = async({firstname,lastname, email, password}) => {
    if(!firstname || !email || !password){
        throw new error('All field are required');
    }
    const user = userModel.create({
        fullname:{
            firstname,
            lastname
        },email,
        password
    })
    return user;
}