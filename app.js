require("dotenv").config();
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookie = require('cookie-parser');
const multer = require('multer');
const paginate = require("express-paginate");

const cloudinary = require('cloudinary').v2;
const db = require('./config/database');

const session = require("express-session");
const flash = require('express-flash');


const app = express();
const port = process.env.APP_PORT ?? process.env.PORT;
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(paginate.middleware(10, 50));

app.use(logger('dev'));
app.use(express.json()); 
app.use(cookie());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname , 'public')));
app.use(flash());


app.use(session({
    name: 'session',
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

app.get('*',(req, res, next)=>{
  res.locals.admin = req.session.admin;
  res.locals.user = req.session.userID || null;
  res.locals.summary = req.session.summary;
  next();
});

app.locals.formatMoney = (number) => {
    return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}
app.locals.formatNumber = (number) => {
    return Number(number);
}






const adminRouter = require('./routes/admin');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productRouter = require('./routes/products');



app.use('/admin', adminRouter);
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productRouter);






app.listen(port,()=>{
  if(process.env.NODE_ENV === 'production') {
    console.log(`connect port ${port}`);
  } else {
    console.log(`start port ${port}`);
  }
});
 
module.exports = app;
