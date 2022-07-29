const db = require('../config/database');
const { check , validationResult} = require('express-validator');

exports.indexPage = (req, res) => {
    db.query('SELECT product_id, products.*, categories.name AS categoryName, sum(quantity) AS sumQuantity\
    FROM `order details`\
    LEFT JOIN products\
    ON `order details`.product_id = products.id\
    LEFT JOIN `categories`\
    ON `products`.category_id = categories.id\
    GROUP BY product_id\
    ORDER BY sumQuantity DESC LIMIT 10;\
    SELECT * FROM categories',(err,rows) => {
        if (err) {
            req.flash('error', err);
            res.render('index',{
                dataProducts : '',
                showAllCategory: '' 
            });
        };
        if (rows) {
            res.render('index', {
                dataProducts: rows[0],
                showAllCategory: rows[1]
            });
        };
    });
};

exports.getContact =(req,res) => {
    res.render('contact');

}
exports.postContact = (req,res) => {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        // console.log(errors);
        const alert = errors.array();
        // console.log(alert);
        res.render('contact', {
            alert,
        });
    } else {
        const {name , email_contact, message} = req.body;
        db.query('INSERT INTO `contact` SET ?', {
            name : name,
            email : email_contact,
            message : message
        });
        req.flash('success','ข้อความของคุณถูกส่งสำเร็จแล้ว!' )
        res.redirect('/contact');
    };
};