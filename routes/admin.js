const express = require('express');
const adminController = require('../controllers/admin.js');
const router = express.Router();
const multer = require('multer');
const paginate = require("express-paginate");


/* GET home page. */

const adminNotLoggedin = (req, res, next) => {
    if(!req.session.admin){
        return res.render('admin/login');
    }
    next();
}
  const adminLoggedin = (req,res,next) => {
    if(req.session.admin){
        return res.render('admin/index');
    }
    next(); 
}
  
router.get('/',adminNotLoggedin , adminController.getAdminPage);
router.post('/',adminLoggedin, adminController.adminLogin);

router.get('/logout', (req, res, next) => {
    req.session.destroy((err) => {
      next(err);
  }); 
    res.redirect('/admin');
});



router.get('/order',adminNotLoggedin,adminController.getOrder);
router.get('/order/view/',adminNotLoggedin,adminController.getOrderByItem);
router.get('/order/confirm/',adminNotLoggedin,adminController.confirmOrder);
router.get('/order/reject/',adminNotLoggedin,adminController.rejectOrder);




// add-category route
router.get('/add-category/',adminNotLoggedin, adminController.getAddCategory);
router.post('/add-category/',adminNotLoggedin, adminController.postAddCategory);

router.get('/add-category/edit/',adminNotLoggedin, adminController.getEditCategory);
router.post('/add-category/edit/',adminNotLoggedin, adminController.postEditCategory);



// add-products route
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './public/img/products')
    },
    filename:function(req, file, cb){
        const uniqueSuffix = Date.now() + '-' + + Math.round(Math.random() * 1E9) + '.jpg' || '.png'
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
});


const upload = multer({ storage: storage});
router.get('/add-product',adminNotLoggedin, adminController.getAddProducts);
router.post('/add-product',adminNotLoggedin, upload.single('productImg'),adminController.postAddProducts);

router.get('/edit-product/',adminNotLoggedin, adminController.getEditProduct);
router.post('/edit-product/',adminNotLoggedin, upload.single('productImg'),adminController.postEditProduct);


router.get('/contact',adminNotLoggedin, adminController.getContact);





module.exports = router;