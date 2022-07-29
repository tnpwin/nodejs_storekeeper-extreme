const express = require('express');
const authController = require('../controllers/auth.js');
const cartController = require('../controllers/cart.js');
const router = express.Router();
const db = require('../config/database');
const { check , validationResult} = require('express-validator');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, './public/img/payment')
  },
  filename:function(req, file, cb){
      const uniqueSuffix = Date.now() + '-' + + Math.round(Math.random() * 1E9) + '.jpg' || '.png'
      cb(null, file.fieldname + '-' + uniqueSuffix)
  }
});
const upload = multer({ storage: storage});



const ifNotLoggedin = (req, res, next) => {
  if(!req.session.userID){
      return res.render('login-register');
  }
  next();
}
const ifLoggedin = (req,res,next) => {
  if(req.session.userID){
      return res.render('user');
  }
  next();
}

router.get('/',ifNotLoggedin , authController.userpage);
router.get('/change-password',ifNotLoggedin ,(req, res) => {
  res.render('changePassword');
});
router.post('/change-password',ifNotLoggedin,authController.changePassword);


router.get('/history',ifNotLoggedin,authController.getHistory);
router.get('/history/order/',ifNotLoggedin,authController.viewHistoryByItem);





router.post('/',ifLoggedin,authController.login);
router.post('/register', ifLoggedin ,authController.register);
router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    next(err);
}); 
  res.redirect('/users');
});


// cart
router.get('/cart',cartController.getCart);
router.post('/cart',cartController.postCart);
router.post('/cart/update/:id',cartController.updateCart);
router.post('/cart/delete/:id',cartController.deleteCart);





// checkout order
router.get('/checkout',cartController.getCheckout);
router.post('/checkout',[
  // check('paymentImg','กรุณาแนบสลีปการโอนเงิน').not().isEmpty(),
  upload.single('paymentImg'),
  check('fullName','กรุณากรอก ชื่อ-นามสกุล ของคุณ').trim().not().isEmpty(),
  check('streetAddress','กรุณากรอก ที่อยู่ ของคุณ').trim().not().isEmpty(),
  check('subdistrict','กรุณากรอกชื่อ ตำบล ของคุณ').trim().not().isEmpty(),
  check('district','กรุณากรอก อำเภอ ของคุณ').trim().not().isEmpty(),
  check('province','กรุณากรอก จังหวัด ของคุณ').trim().not().isEmpty(),
  check('postcode','กรุณากรอก รหัสไปรษณีย์ ของคุณ').trim().not().isEmpty(),
  check('tel','กรุณากรอก เบอร์โทรศัพท์ ของคุณ').trim().not().isEmpty(),

],cartController.postCheckout);





module.exports = router;
