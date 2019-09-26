const express = require('express'); 
const bodyParser = require('body-parser');
const path = require('path'); 
var mongoose = require('mongoose');
var Fruit = require('./Model/Fruit');
var multer = require('multer');
var fs = require('fs'); 
const session = require('express-session'); 
const cookieParser = require('cookie-parser');
const User = require('./Model/User');

let AUTHENTIC_USER = {status : false};

var app = express(); 

app.use(express.static('public'));
app.use(express.urlencoded()); 
app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

mongoose.connect('mongodb://localhost/PRODUCT_DB' , function (err) {
  if (err) throw err; 
  console.log('success');
});

/// request.session.user indicates the logged in user
/// request.cookie.user_sid indicates the user data saved in the cookie
app.use(cookieParser());

// initialize express-session to allow us track the logged-in user across sessions.
app.use(session({
    key: 'users_sid',
    secret: 'somerandonstuffs',
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000
    }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
      console.log('cookie is clearing');  
      res.clearCookie('users_sid');        
    }
    next();
});


// middleware function to check for logged-in users
var sessionChecker = (req, res, next) => {
    console.log('session object : ' + req.session);
    console.log("session user = " + req.session.user); 
    console.log( "cookie sid = " + req.cookies.users_sid);
    if (!req.session.user || !req.cookies.users_sid) {
        res.redirect('/login');
    } else {
        next();
    }    
};

app.get('/allusers', sessionChecker , (req , res , next) => {
  User.find()
    .then(user => {
      res.json(user);
    })
    .catch(err => {
      res.send(err); 
    });
});

app.get('/isloggedinuser' , (req , res , next) => {
  if (req.session.user && req.cookies.users_sid) {
    res.send('yes');
  } else {
    res.send('no');
  }
});

app.post('/login' , (req , res , next) => {
  let user_mail = req.body.email; 
  let user_pass = req.body.password;
  console.log(req.body);
  // search mail to database
  User.findOne({email : user_mail} , function (err , result) {
    if (err) throw err; 
    else {
      if (!result) {
        res.send('email not found');
      } else {
        if (result.password == user_pass) {
          req.session.user = result.email;
          
          res.redirect('/');
        } else {
          res.send('password does not match');
        }
      }
    }
  });
});

app.get('/logout' , (req , res , next)=> {
  req.session.user = null ; 
  res.clearCookie('users_sid');
  res.send('logout');
})

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
}); 

var upload = multer({storage : storage});

app.get('/photouploads' , function (request , response) {
  response.sendFile(path.join(__dirname + '/public/photoupload/customer.html'));
})

app.post('/uploadfiles', upload.single('file') , function (request , response) {
  
  response.send(request.file);
});

// Home page
app.get('/' , function (request , response) {
  response.sendFile(path.join(__dirname + '/public/Home/home.html'));
});


//  fruits page
app.get('/fruits', function(request ,response) {
  response.sendfile(path.join(__dirname + '/public/Fruit/index.html'));
});

// get all fruits 
app.get('/api/fruits' , function (request , response) {
  Fruit.find().exec(function (err , result) {
    if (err) throw err; 
    //response.send(result);
    var fruitsList = []; 
    for (var i = 0; i < result.length ; i++) {
      var item = result[i]; 
      fruitsList.push({
        name : item.name , 
        _id : item._id , 
        taste : item.taste , 
        price : item.price , 
        origin : item.origin , 
        photo : {
          contentType : item.photo.contentType , 
          data : item.photo.image.toString('base64')
        } , 
        __v : item.__v
      });
    }
    response.send(fruitsList);  
  });
}); 

//get fruits by id
app.get('/api/fruits/:id' , function (request , response) {
  Fruit.findById(request.params.id , function (err , result) {
    if (err) {
      response.send('404 Not Found');
    }
    response.send({
      _id : result._id , 
      name : result.name , 
      price : result.price ,
      origin : result.origin , 
      __v : result.__v , 
      taste : result.taste , 
      photo : {
        contentType : result.photo.contentType , 
        data : result.photo.image.toString('base64')
      }
    }); 
  });
}); 

// post a fruit
app.post('/api/fruits' ,  upload.single('fruitPhoto') , function (request ,response) {
  var newFruit = new Fruit (request.body); 
  
  if (!request.file) return response.send('file is required')

  var img = fs.readFileSync(request.file.path); 
  var encode_image = img.toString('base64'); 

  newFruit.photo = {
    contentType : request.file.mimetype , 
    image : new Buffer(encode_image , 'base64')
  }

  newFruit.save(function (err ,newFruit) {
    if (err) {
      return response.send(err.message);
    }
    response.send(newFruit); 
  });
});

// update a fruit
app.put('/api/fruits/:id' , upload.single('fruitPhoto') , function(request , response) {
  var newFruit = new Fruit ({
    _id : request.params.id , 
    name : request.body.name , 
    taste : request.body.taste , 
    price : request.body.price , 
    origin : request.body.origin 
  });

  if (request.file) { // if new file is given then update it otherwise continue
    var img = fs.readFileSync(request.file.path); 
    var encode_image = img.toString('base64'); 

    newFruit.photo = {
      contentType : request.file.mimetype , 
      image : new Buffer(encode_image , 'base64') 
    }
  }

  Fruit.findById(request.params.id , function (err , res) {
    if (err) return response.send('404 fruit is not found');
    
    Fruit.findByIdAndUpdate(request.params.id , newFruit , {runValidators : true} , function (err , result) {
      if (err) return response.send(err.message); 
      response.send(result);
    })
  });  
});

// delete a fruit
app.delete('/api/fruits/:id' , sessionChecker ,function (request , response) {
  Fruit.findById(request.params.id).exec(function (err , res) {
    if (err) return response.send('fruit not found'); 
    Fruit.findByIdAndDelete(request.params.id , function (err , res) {
      if (err) return response.send(err); 
      response.send(res);
    });
  });
});


app.get('*' , function (request , response) {
  console.log(request.url);
  response.sendFile(path.join(__dirname + '/public/Fruit/index.html'));
}); 


app.listen(1234 , function () {
  console.log('listening at port 1234');
}); 