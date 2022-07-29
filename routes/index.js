const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index');
const { check , validationResult} = require('express-validator');

/* GET home page. */

router.get('/',indexController.indexPage);


router.get('/contact', indexController.getContact);
router.post('/contact',[
    check('name', 'กรุณาป้อนชื่อของคุณ').trim().not().isEmpty(),
    check('email_contact', 'กรุณาป้อนอีเมล์ของคุณ').trim().not().isEmpty(),
    check('message', 'กรุณาป้อนข้อความ').trim().not().isEmpty(),
], indexController.postContact);



router.get('/howtoBuy',(req,res) => {
    res.render('howtoOrder');
}); 

module.exports = router;
