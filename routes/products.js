const express = require('express');
const productController = require('../controllers/product');
const router = express.Router();


router.get('/',productController.productPage);

router.get('/category/',productController.getProductByCategory);
router.get('/:id',productController.getProductById);


module.exports = router;
