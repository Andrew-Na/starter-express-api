// const express = require('express')
// const app = express()
// app.all('/', (req, res) => {
//     console.log("Just got a request!")
//     res.send('Yo!')
// })
// app.listen(process.env.PORT || 3000)
const express = require("express")
const cors = require("cors")
const userService = require("./user-services.js")
const jwt = require('jsonwebtoken')
const passport = require("passport")
const passportJWT = require("passport-jwt")
const app = express()
const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const HTTP_PORT = process.env.PORT || 3000

// JSON Web Token Setup
let ExtractJwt = passportJWT.ExtractJwt
let JwtStrategy = passportJWT.Strategy

// Configure its options
let jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt'),
  secretOrKey: '&0y7$noP#5rt99&GB%Pz7j2b1vkzaB0RKs%^N^0zOP89NT04mPuaM!&G8cbNZOtH',
}

// IMPORTANT - this secret should be a long, unguessable string
// (ideally stored in a "protected storage" area on the web server).
// We suggest that you generate a random 50-character string
// using the following online tool:
// https://lastpass.com/generatepassword.php

let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload)

    if (jwt_payload) {
        // The following will ensure that all routes using 
        // passport.authenticate have a req.user._id, req.user.userName, req.user.fullName & req.user.role values 
        // that matches the request payload data
        next(null, { _id: jwt_payload._id, 
            userName: jwt_payload.userName, 
            fullName: jwt_payload.fullName, 
            role: jwt_payload.role })
    } else {
        next(null, false)
    }
});

// tell passport to use our "strategy"
passport.use(strategy)

// add passport as application-level middleware
app.use(passport.initialize())

app.use(cors())
app.use(express.json())
app.get("/api", (req, res) => {
   //res.json({ "message": "login successful"});
  res.send('test')
});

app.post("/api/login", (req, res) => {
  userService.checkUser(req.body)
      .then((user) => {

          let payload = { 
              _id: user._id,
              userName: user.userName,
              fullName: user.fullName,
              role: user.role
          };
          
          let token = jwt.sign(payload, jwtOptions.secretOrKey);

          res.json({ "message": "login successful", "token": token });
      }).catch((msg) => {
          res.status(422).json({ "message": msg });
      });
});

app.use((req, res) => {
  res.status(404).end();
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://asequeira:akCuxsZzGn0DEu5G@cluster0.sd7rodv.mongodb.net/simple-API-users?retryWrites=true&w=majority');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
connectDB().then(()=>{
  app.listen(HTTP_PORT, ()=>{
      console.log("API listening on: " + HTTP_PORT);
  });
}).catch(err=>console.log(err))
