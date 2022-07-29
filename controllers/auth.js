const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { validationResult} = require('express-validator');
const paginate = require("express-paginate");


exports.userpage = async (req,res) => {
    db.query('SELECT * FROM users WHERE id = ?',[req.session.userID], async (err, results) => {
        if (!results) {
            res.status(401).render('login-register');
        } else {
            res.render('user', {
                user: results[0]
            });
        }
    });
};


exports.register = (req,res) => {
    const { username, email, password, cpassword} = req.body;
    try {
        if (!username || !email || !password || !cpassword) {
            return  res.status(400).render('login-register', {
                err_message: ["Please provide all fields"]
            })
        }
    } catch (err) {
        console.log(err)
    }

    db.query('SELECT username,email FROM users where username = ? OR email = ?',[username,email], async (err, results)=> {
        if (err) {
            console.log(err);
        } else {
            if(results.length > 0) {
                return res.render('login-register', {
                    err_message: ['username or email is already in use']
                })
            } else if (password !== cpassword) {
                return res.render('login-register', {
                    err_message: ["Password don't match"]
                });
            }
        }
        let hashedPassword = await bcrypt.hash(password, 10); 
        
        db.query('INSERT INTO users SET ?', { username:username, email:email, password:hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                return res.render('login-register', {
                    success_message: ['Register successful']
                });
            };
        });
    });
};


exports.login = async (req,res) => {
    try {
        const { username , password}  = req.body;
        if (!username || !password) {
            res.status(401).render('login-register', {
                err_message : ['Please provide all fields']
            });
        };
        db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results,fields) => {
            // console.log(results);
            // console.log(fields);
            if (results.length != 1) {
                return res.status(401).render('login-register', {
                    err_message : ['Not found username']
                });
            }
            try {
                const checkPassword = await bcrypt.compare(password, results[0].password);
                if (checkPassword === true) {
                    req.session.userID = results[0].id
                    return res.redirect('/users');
                } 
                res.render('login-register', {
                    err_message : ['Password is incorrect!']
                })
            } catch (e) {
                console.log(e)
            }
        });
    } catch(e) {
        console.log(e);

    }
};


exports.changePassword = ( req, res ) => {
    let user = {
        id: req.session.userID,
        old: req.body.current,
        new: req.body.new,
        confirm: req.body.confirm
    };
    if(!user.old || !user.new || !user.confirm) {
        return res.status(401).render('changePassword', {
            user:req.session.userID,
            err_message : "Please provide all fields!"
        })
    }else if (user.new !== user.confirm) {
        return res.status(401).render('changePassword',{
            user:req.session.userID,
            err_message : 'Password is not match!'
        })
    }
    try {
        db.query('SELECT * FROM users WHERE id = ?',[user.id],(err, results) => {
            // console.log(results)
            if (err) {
                console.log(err);
            }
            bcrypt.compare(user.old,results[0].password,(err, match) => {
                if (match) {
                    bcrypt.hash(user.new ,10,(err, hash) => {
                        db.query('UPDATE users SET password = ? WHERE id = ?',[hash,user.id],(err)=> {
                            if(err){
                                console.log(err);
                            } else {
                                return res.render('changePassword',{
                                    success_message : "Password has been changed successfully!",
                                    user: results[0]
                                });
                            };
                        });
                    });
                } else {
                    return res.render('changePassword',{
                        err_message : "Old Password is incorrect!",
                        user: results[0]
                    });
                };
            });
        });

    } catch (e) {
        console.log(e);
    };
};
                    
exports.getHistory = (req,res) => {
    let user = req.session.userID;
    const quantityPerPage = 7;
    if(user) {
        db.query('SELECT COUNT(order_id) AS count FROM orders WHERE user_id = ?;',[user], (err,rows) => {
            if(err) throw err;
            let numOfPage;
            rows.forEach((item) => {
                const numOfresult = item.count;
                // console.log(numOfresult);
                numOfPage = Number(Math.ceil(numOfresult / quantityPerPage));
            });
            let page = req.query.page ? Number(req.query.page) : 1;

            const startingLimit = (page - 1) * quantityPerPage;

            db.query(`SELECT * FROM orders WHERE user_id = ? ORDER BY order_id DESC\
            LIMIT ${startingLimit},${quantityPerPage};`,[user], (err,result) => {
                // console.log(result)
                if(result) {
                    return res.render('history', {
                        data : result,
                        numOfPage,
                        pages: paginate.getArrayPages(req)(3, numOfPage, page),
                    });
                } else {
                    return res.render('history', {
                        data : '',
                    })
                };
            });
        });
    };
};

exports.viewHistoryByItem = (req,res) => {
    let user = {
        id : req.session.userID,
        orderId : req.query.view
    }
    if (user.id) {
        let dataQuery = 'SELECT orders.*,addresses.* FROM `orders`\
        LEFT JOIN `addresses`\
        ON `orders`.user_id = `addresses`.user_id\
        WHERE(orders.user_id = ? AND orders.order_id = ?);\
        SELECT `order details`.*, categories.name AS categoryName, products.name, products.color FROM `order details`\
        LEFT JOIN `orders`\
        ON `order details`.order_id = orders.order_id\
        LEFT JOIN `products`\
        ON `order details`.product_id = `products`.id\
        LEFT JOIN `categories`\
        ON `products`.category_id = `categories`.id\
        WHERE(orders.user_id = ? AND orders.order_id = ?);'
        db.query (dataQuery,[user.id,user.orderId,user.id,user.orderId],(err,rows) => {
            // console.log(rows);
            if(err) throw err;
            if(rows) {
                return res.render('viewHistory', {
                    data : rows[0],
                    products : rows[1]
                });
            } else {
                return res.render('viewHistory', {
                    data : '',
                    products : ''
                });
            };
        });
    } else {
        return res.redirect('/users');
    }
};
   
   

















