const express = require("express");
const mongoose = require("mongoose");
const mysql = require('mysql'); 
const dotenv = require("dotenv");




const createError = require('http-errors');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('express-flash');
const session = require('express-session');
const bodyParser = require('body-parser');

/**
 * This middleware provides a consistent API 
 * for MySQL connections during request/response life cycle
 */ 
const myConnection  = require('express-myconnection');





dotenv.config();
var dbOptions = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
}

const userRoute = require("./routes/user");



const cors = require("cors");

const app = express();

/**
 * 3 strategies can be used
 * single: Creates single database connection which is never closed.
 * pool: Creates pool of connections. Connection is auto release when response ends.
 * request: Creates new connection per new request. Connection is auto close when response ends.
 */ 
app.use(myConnection(mysql, dbOptions, 'pool'))



app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(cors());
app.use(express.json());


app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
 
app.use(session({ 
    secret: '123458cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
 
app.use(flash());
 

app.use("/api/users", userRoute);
 



app.listen(3000, function(){
console.log('Server running at port 3000: http://127.0.0.1:3000')

})


module.exports = app;
