const db = require('../config/database');

exports.productPage = (req, res) => {
    db.query('SELECT products.id, products.name AS productsName, products.price, products.discount, products.image, products.color ,products.total, categories.name AS categoriesName FROM products LEFT JOIN categories ON products.category_id = categories.id; SELECT * FROM categories',(err,rows) => {
        if (err) {
            req.flash('error', err);
            res.render('products',{
                dataProducts : rows
            });
        };
        if (rows.length > 0 ) {
            res.render('products', {
                dataProducts: rows[0],
                showAllCategory: rows[1]

            });
        };
    });
};

exports.getProductById = (req, res) => {
    const { id } = req.params;
    // console.log(id);
    let sql = 'SELECT products.id, products.name AS productsName, products.color, products.total, products.image, products.discount, products.price ,categories.name AS categoriesName FROM products LEFT JOIN categories ON (products.category_id = categories.id) WHERE products.id = ?';
    db.query(sql,[id],(err,rows) => {
        if (err) {
            req.flash('error', err);
            res.render('productById',{
                data: ''
            });
        };
        if (rows.length > 0) {
            res.render('productById',{
                data: rows
            });
        } else {
            res.send('404 page not found');
        };
    });
};




exports.getProductByCategory = (req, res) => {
    let name = req.query.category;
    db.query('SELECT products.id, products.name AS productsName, products.price, products.discount, products.image, products.color ,products.total, categories.name AS categoriesName FROM categories RIGHT JOIN products ON categories.id = products.category_id WHERE categories.name = ?; SELECT * FROM categories ',[name],(err,rows) => {
        if (err) {
            req.flash('error', err);
            res.render('productByCategory',{
                dataProducts : ''
            });
        };
        if (rows.length > 0 ) {
            res.render('productByCategory', {
                dataProducts: rows[0],
                showAllCategory: rows[1]
            });
        };
    });
};




















