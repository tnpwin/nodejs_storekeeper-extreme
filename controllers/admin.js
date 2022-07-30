const db = require('../config/database');
const multer = require('multer');
const paginate = require("express-paginate");
const bcrypt = require('bcryptjs');
const { cloudinary } = require('../config/cloudinary');



// admin Page

exports.adminLogin = async (req,res) => {
    try {
        const { username , password}  = req.body;
        if (!username || !password) {
            res.render('admin/login', {
                err_message : ['กรุณาใส่ username และ password']
            });
        };
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results,fields) => {
            if (results.length != 1) {
                return res.render('admin/login', {
                    err_message : ['ไม่มี username นี้ในระบบ']
                });
            }
        
            try {
                const checkPassword = await bcrypt.compare(password, results[0].password);
                if (checkPassword === true) {
                    if (results[0].role == 'admin') {
                        req.session.admin = results[0].id
                        return res.redirect('/admin');
                    } else {
                        res.render('admin/login', {
                            err_message : ['username นี้ไม่ได้เป็น Admin!']
                        });
                    };
                } else {
                    res.render('admin/login', {
                        err_message : ['Password is incorrect!']
                    });
                };
            } catch (e) {
                console.log(e)
            };
        });
    } catch(e) {
        console.log(e);

    }
};

exports.getAdminPage = (req, res) => {
    db.query('SELECT product_id, products.*, categories.name AS categoryName, sum(quantity) AS sumQuantity\
    FROM `order details`\
    LEFT JOIN products\
    ON `order details`.product_id = products.id\
    LEFT JOIN `categories`\
    ON `products`.category_id = categories.id\
    GROUP BY product_id\
    ORDER BY sumQuantity DESC LIMIT 5;\
    SELECT * FROM categories ORDER BY id;\
    SELECT COUNT(id) AS count FROM products;\
    SELECT COUNT(id) AS count FROM categories;\
    SELECT COUNT(order_id) AS count FROM orders WHERE status_order IS NULL;\
    SELECT COUNT(id) AS count FROM contact;', (err,rows) => {
        // console.log(rows[5]);
        if (err) {
            req.flash('error', err);
            res.render('admin/index', {
                dataProducts: '',
                dataCategories:'',
                countProducts: '', 
                countCategories: '', 
                countOrder: '', 
                countContact: '', 
               });
        } else {
            res.render('admin/index', {
                 dataProducts: rows[0],
                 dataCategories:rows[1],
                 countProducts: rows[2], 
                 countCategories: rows[3],
                 countOrder: rows[4],  
                 countContact: rows[5],  
            });
        };
    });
};

// category section

exports.getAddCategory = (req, res) => {
    db.query('SELECT * FROM categories ORDER BY id', (err, rows) => {
        if (err) {
            req.flash('error', err);
            res.render('admin/addCategory', { data: '' });
        } else {
            res.render('admin/addCategory', { data : rows });
        };
    });
};

exports.postAddCategory = (req, res, next) => {
    let name = req.body.categoryName;
    let errors = false;

    db.query('SELECT * FROM categories ORDER BY id',(err,output) => {
        if (err) {
            req.flash('error', err);
            res.render('admin/addCategory',{data : output});  
        }
        if (name.length === 0) {
            errors = true
            req.flash('error', "กรุณาใส่ชื่อหมวดหมู่สินค้า");
            res.render('admin/addCategory',{data :output});
        }
        if(!errors){
            db.query('SELECT * FROM categories WHERE name = ? ', [name], (err,rows) => {
                if (rows.length > 0) {
                    req.flash('error', "ชื่อหมวดหมู่สินค้านี้ใช้ไปแล้ว");
                    res.render('admin/addCategory',{data : output});  
                } else {
                    db.query('INSERT INTO categories SET ?' ,{name : name}, (err,result) => {
                        if (err) {
                            req.flash('error', err)
                            res.render('admin/addCategory',{data : output});
                        } else {
                            req.flash('success', 'เพิ่มหมวดหมู่สินค้าสำเร็จ!');
                            res.redirect('/admin/add-category');
                        };
                    });
                };
            });
        };
    });
};

exports.getEditCategory = (req,res) => {
    let id = parseInt(req.query.id);
    // console.log(typeof(id));
    db.query('SELECT * FROM categories WHERE id = ? ',[id], (err,result) => {
        if(err) throw err;
        if(result) {
            res.render('admin/editCategories', {
                data : result
            });
        };
    });
};
exports.postEditCategory = (req,res) => {
    let category = {
        id : parseInt(req.query.id),
        name : req.body.categoryName.trim()
    }

    db.query('SELECT name FROM categories WHERE name = ?',[category.name], (err,result) => {
        if(err) throw err;

        if (result.length > 0) {
            req.flash('error', "หมวดหมู่สินค้านี้มีอยู่แล้ว โปรดใช้ชื่ออื่น")
            res.redirect('/admin/add-category');
        } else {
            db.query('UPDATE categories SET ? WHERE id = ?',[{ name : category.name },category.id],(err,results) => {
                req.flash('success', "ทำการอัพเดทหมวดหมู่สินค้าสำเร็จ")
                res.redirect('/admin/add-category');
            });
        };
    });
};



// products section

exports.getAddProducts = (req, res) => {
    const quantityPerPage = 5;
    db.query('SELECT COUNT(id) AS count FROM products;', (err,rows) => {
        if(err) throw err;
        rows.forEach((item) => {
            const numOfresult = item.count;
            // console.log(numOfresult);
            numOfPage = Number(Math.ceil(numOfresult / quantityPerPage));

            let page = req.query.page ? Number(req.query.page) : 1;

            const startingLimit = (page - 1) * quantityPerPage;

            db.query(`SELECT products.id, products.name AS productsName, products.price, products.discount,products.image, products.total, products.color ,categories.name AS categoriesName FROM products\
            LEFT JOIN categories ON products.category_id = categories.id ORDER BY products.id DESC\
            LIMIT ${startingLimit},${quantityPerPage};\
            SELECT * FROM categories ORDER BY id;`,(err,data) => {
                if (err) {
                    console.log(err);
                } else {
                    if(data) {
                        res.render('admin/addProduct',{
                            dataAllProducts : data[0],
                            dataAllCategories : data[1],
                            numOfPage,
                            pages: paginate.getArrayPages(req)(3, numOfPage, page),
                        }); 
                    };
                };
            });
        });
        
    });
};

exports.postAddProducts = async (req, res) => {
    // console.log(req.file.filename);
    db.query('SELECT products.id, products.name AS productsName, products.price, products.discount,products.image, products.total, categories.name AS categoriesName FROM products\
    LEFT JOIN categories ON products.category_id = categories.id;\
    SELECT * FROM categories ORDER BY id', async (err,data) => {
        const{ category, name, price, discount, color, amount} = req.body;
        if ( !category || !name || !price || !color || !amount || !req.file ) {
            req.flash('error', 'กรุณากรอกข้อมูลให้ครบ');
            res.render('admin/addProduct',{
                dataAllProducts : data[0],
                dataAllCategories : data[1]
            });
        } else {
            // console.log("file details: ", req.file);

            // cloudinary.v2.uploader.upload(file, options, callback);
            const image = await cloudinary.uploader.upload(req.file.path);
            // console.log("result: ", image);

            db.query('SELECT * FROM categories WHERE name = ?',[category],(err,result) => {
                // console.log(result);
                if (err) {
                    req.flash('error', err)
                    res.render('admin/addProduct',{
                        dataAllProducts : data[0],
                        dataAllCategories : data[1]
                    })
                }
                if (result.length > 0) {
                    db.query('INSERT INTO products SET ?',{
                        name:name.toLocaleUpperCase(), 
                        color:color.toLocaleUpperCase(), 
                        total:amount,
                        price:price,
                        discount:discount,
                        image: image.url,
                        category_id:result[0].id},
                        (err,results) => {
                        if(err) {
                            req.flash('error', err)
                            res.render('admin/addProduct',{
                                dataAllProducts : data[0],
                                dataAllCategories : data[1]
                            })
                        } else {
                            req.flash('success', "อัพโหลดสินค้าสำเร็จ")
                            res.redirect('/admin/add-product');
                        };
                        // console.log(results);
                    });
                };
            }); 
        };
    });
};

exports.postEditProduct = async (req,res) => {

    let id = req.query.id;
    const{ category, name, price, discount, color, amount} = req.body;

    if ( !category || !name || !price || !color || !amount ) {
        req.flash('error', 'กรุณากรอกข้อมูลให้ครบ');
        res.render('admin/getEditProduct');
    } else {
        db.query('SELECT * FROM categories WHERE name = ?',[category], async (err,result) => {
            // console.log(result);
            if (result.length > 0) {
                if (req.file) {
                    const image = await cloudinary.uploader.upload(req.file.path);
                    db.query('UPDATE products SET ? WHERE id = ?',[{
                        name:name.toLocaleUpperCase(), 
                        color:color.toLocaleUpperCase(), 
                        total:amount,
                        price:price,
                        discount:discount,
                        image: image.url,
                        category_id:result[0].id},id],
                        (err,results) => {

                        req.flash('success', "ทำการอัพเดทสินค้าสำเร็จ")
                        res.redirect('/admin/add-product');
                    });

                } else {
                    db.query('UPDATE products SET ? WHERE id = ?',[{
                        name:name.toLocaleUpperCase(), 
                        color:color.toLocaleUpperCase(), 
                        total:amount,
                        price:price,
                        discount:discount,
                        category_id:result[0].id},id],
                        (err,results) => {
        
                        req.flash('success', "ทำการอัพเดทสินค้าสำเร็จ")
                        res.redirect('/admin/add-product');
                    });
                };
            };
        }); 
    };
};

exports.getEditProduct = (req,res) => {
    let id = req.query.id;
    db.query('SELECT products.*, categories.name AS categoryName FROM products\
    LEFT JOIN categories\
    ON products.category_id = categories.id\
    WHERE products.id = ?; SELECT * FROM categories ORDER BY id',[id], (err,row)=> {
        if(err) throw err;
        res.render('admin/getEditProduct', {
            products: row[0],
            dataAllCategories : row[1]
        });
    });
};


exports.getOrder = (req,res) => {
    const quantityPerPage = 10;

    db.query('SELECT COUNT(order_id) AS count FROM orders;', (err,rows) => {
        if(err) throw err;
        let numOfPage;
        rows.forEach((item) => {
            const numOfresult = item.count;
            // console.log(numOfresult);
            numOfPage = Number(Math.ceil(numOfresult / quantityPerPage));
        });
        // console.log(numOfPage);
        let page = req.query.page ? Number(req.query.page) : 1;

        const startingLimit = (page - 1) * quantityPerPage;

        db.query(`SELECT orders.*,users.id AS userId, users.email, users.username FROM orders\
        LEFT JOIN users ON orders.user_id = users.id ORDER BY orders.order_id DESC\
        LIMIT ${startingLimit},${quantityPerPage};`,(err,result) => {

            if(err) throw err;

            res.render('admin/order', {
                data : result,
                numOfPage,
                pages: paginate.getArrayPages(req)(3, numOfPage, page),
            });
        });
    });
};

exports.getOrderByItem = (req,res) => {
    let order = req.query.view;
    // console.log(order);

    let dataQuery = 'SELECT orders.*,addresses.* FROM `orders`\
        LEFT JOIN `addresses`\
        ON `orders`.user_id = `addresses`.user_id\
        WHERE orders.order_id = ?;\
        SELECT `order details`.*, categories.name AS categoryName, products.name, products.color FROM `order details`\
        LEFT JOIN `orders`\
        ON `order details`.order_id = orders.order_id\
        LEFT JOIN `products`\
        ON `order details`.product_id = `products`.id\
        LEFT JOIN `categories`\
        ON `products`.category_id = `categories`.id\
        WHERE orders.order_id = ?;'
        db.query (dataQuery,[order,order],(err,rows) => {
            // console.log(rows);
            if(err) throw err;
            if(rows) {
                return res.render('admin/editOrder', {
                    data : rows[0],
                    products : rows[1]
                });
            } else {
                return res.render('admin/editOrder', {
                    data : '',
                    products : ''
                });
            };
        });
};

exports.confirmOrder = (req,res) => {
    let order = req.query.confirm;
    let dataQuery = 'UPDATE orders SET status_order = "true" WHERE order_id = ?';
    db.query(dataQuery, [order], (err,result) => {
        // if (err) throw err;
        let reduceQuantity = 'SELECT `order details`.product_id AS orderProductId, `order details`.quantity AS orderQuantity, products.id AS productId, products.total AS productQuantity\
        FROM `order details`\
        LEFT JOIN `products`\
        ON `order details`.product_id = `products`.id\
        WHERE `order details`.order_id = ?;'

        db.query(reduceQuantity,[order],(err,rows) => {
            try {
                rows.forEach(item => {
                    if (item.orderProductId == item.productId) {
                        item.productQuantity -= item.orderQuantity;
                        db.query('UPDATE products SET ? WHERE id = ?',[{
                            total:item.productQuantity
                        },item.productId]);
                    };
                    req.flash('success', 'อนุมัติรายการสั่งซื้อ เลขที่' + ' ' + order + ' ' + 'เรียบร้อย');
                    res.redirect('/admin/order');
                });
            }catch (err) {
                console.log(err);
            }
        });
    });
};

exports.rejectOrder = (req,res) => {
    let order = req.query.reject;
    let dataQuery = 'DELETE FROM `orders` WHERE order_id = ?';
    db.query(dataQuery, [order], (err,result) => {
        if (err) throw err;
        req.flash('success', 'ลบรายการสั่งซื้อ เลขที่' + ' ' + order + ' ' + 'เรียบร้อย');
        res.redirect('/admin/order');
    });
};


exports.getContact = (req,res) => {
    let dataQuery = 'SELECT * FROM `contact` ORDER BY id DESC';

    db.query(dataQuery, (err,rows) => {
        if (err) throw err;
        if(rows) {
            res.render('admin/getContact', {
                data: rows
            });
        };
    });
};
