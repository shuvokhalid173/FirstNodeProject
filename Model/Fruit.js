var mongoose = require('mongoose'); 

var fruitSchema = mongoose.Schema({
    name : {
        type : String , 
        required : [true , 'name is required']
    } , 
    price : {
        type : Number , 
        required : true , 
        validate : {
            validator : function (text) {
                return text > 20;
            } , 
            message : 'price should be gretter than 20'
        }
    } , 
    taste : {
        required : true , 
        type : String 
    } , 
    origin : String , 
    photo : {
        contentType : {
            type : String
        } , 
        image : {
            type : Buffer
        }
    }
}); 

var Fruit = mongoose.model('fruits' , fruitSchema); 

module.exports = Fruit;