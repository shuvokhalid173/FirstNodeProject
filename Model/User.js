const mongoose = require('mongoose'); 

let userSchema = mongoose.Schema({
    email : {
        type : String , 
        required : true , 
        validate : {
            validator : (text) => {
                for (let i = 0; i < text.length; i++) {
                    if (text[i] == '@') {
                        return true;
                    }
                } 
                return false;
            } , 
            message : 'given email is not valid'
        }
    } , 
    password : {
        type : String ,
        required : true , 
        validate : {
            validator : (text) => {
                return text.length === 5
            } , 
            message : 'password should be 5 characters long'
        }
    }
});

let User = mongoose.model('user' , userSchema);

module.exports = User;