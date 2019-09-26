module.exports = function () {
    const express = require('express'); 
    const bodyParser = require('body-parser');
    const path = require('path'); 
    var mongoose = require('mongoose');
    var Fruit = require('./Model/Fruit');
    var multer = require('multer');
    var fs = require('fs'); 
    
    var app = express(); 
    
    app.use(express.static('public'));
    app.use(express.urlencoded()); 
    app.use(express.json());
    
    
    mongoose.connect('mongodb://localhost/PRODUCT_DB' , function (err) {
      if (err) throw err; 
      console.log('success');
    });
    
    
    /**
     * Multer tutorial 
     */
    
    var storage = multer.diskStorage ({
      destination : function (req , file , cb) {
        cb (null ,'./upload/'); 
      } , 
      filename : function (req , file , cb) {
        cb (null , file.originalname); 
      }
    }); var upload = multer({storage : storage});
    
app.get('/photoupload' , function (request , response) {
    response.sendFile(path.join(__dirname + '/public/photoupload/index.html'));
   });
  
   var animalSchema = mongoose.Schema ({
    name : String , 
    photo : {
      contentType : String , 
      image  : Buffer
    }
   }); 
  
   var Animal = mongoose.model('animals' , animalSchema); 
  
   app.post('/upload/photo' , upload.single('flower') , function (request , response , next) {
     var img = fs.readFileSync(request.file.path); 
     //console.log(img); 
     var encode_image = img.toString('base64');
     //console.log('encode = ' + encode_image );
  
      var tiger = new Animal ({
        name : 'nothing' , 
        photo : {
          contentType : request.file.mimetype  , 
          image : new Buffer(encode_image , 'base64') 
        }
      });
  
      tiger.save(function (err , tiger) {
        if (err) throw err; 
        response.send('successfull');
      });
   });
  
  app.get('/getPhotos/:id' , function (request , response) {
    Animal.findById(request.params.id).exec (function (err , result) {
      console.log(result)
      
      //response.contentType('image/png')
      var x = result.photo.image.toString('base64').toString();
      console.log(x);
      response.send(x); 
    });
  });
}