const db = require('../config/database');
const { validationResult } = require('express-validator');
const { cloudinary } = require('../config/cloudinary');


exports.getCart = (req,res) => {

    let summary = req.session.summary;
    let cartSummary;

    if (summary)
        cartSummary = {
            subTotal: summary.subTotal,
            shipping: summary.shipping,
            total: summary.total,
            totalQuantity: summary.totalQuantity,
        };
        let cart = req.session.cart;
        let showCart = [];

        for (let items in cart) {
            let item = cart[items];
            if (cart[items].quantity > 0) {
                
                showCart.push({
                    id : item.id,
                    name : item.name,
                    color : item.color,
                    image :item.image,
                    category : item.category,
                    price : item.price,
                    discount : item.discount,
                    quantity : item.quantity,
                    productTotal : item.productTotal
                });
            };
        };
        req.session.showCart = showCart;
        req.session.cartSummary = cartSummary;

        let contextDict = {
            customer : req.session.userID,
            cart: showCart,
            summary: cartSummary
        };
        res.render('cart', contextDict);
};
exports.deleteCart = (req, res) => {
    let cart = req.session.cart;
    let summary = req.session.summary;
    let {id} = req.params;
    
    summary.totalQuantity -= cart[id].quantity;
    cart[id].quantity = 0;
    summary.subTotal = summary.subTotal - cart[id].productTotal;
    summary.total = summary.total - cart[id].productTotal;
    cart[id].productTotal = 0;

    res.redirect('/users/cart/');
};

exports.updateCart = (req, res) => {
    let cart = req.session.cart;
    // console.log(cart);
    let {id} = req.params;
    let newQuantity = parseInt(req.body.quantity);
    // console.log(id);

    for (let item in cart) {
        if (cart[item].id == id) {
            let diff = newQuantity - cart[item].quantity;
            if (diff != 0) {
                let summary = req.session.summary;
    
                summary.subTotal = summary.subTotal + cart[item].price * diff;
                summary.total = summary.total + cart[item].price * diff;
                cart[item].productTotal = cart[item].productTotal + cart[item].price * diff;
                cart[item].quantity = newQuantity;
                summary.totalQuantity+= diff;
            };
        };
    };
    res.redirect('/users/cart/');
};


exports.postCart = (req, res) => {
    let productId = req.body.productId;

    req.session.cart = req.session.cart || {};
    let cart = req.session.cart;

    req.session.summary = req.session.summary || {
        totalQuantity: 0,
        subTotal: 0,
        shipping: 0,
        total: 0
    };

    let summary = req.session.summary;

    let sql = 'SELECT products.*, categories.name AS categoriesName\
                FROM products LEFT JOIN categories\
                ON products.category_id = categories.id\
                WHERE products.id = ?' 
    db.query(sql,[productId], (err, rows) => {
        let plusPrice = 0;
        let inputQuantity = parseInt(req.body.quantity);
        // console.log(rows);
        // console.log(inputQuantity);

        if(cart[productId]) {
            if (inputQuantity) {
                cart[productId].quantity += inputQuantity;
                plusPrice = cart[productId].price * inputQuantity;
                cart[productId].productTotal += plusPrice;
                summary.subTotal += plusPrice;
                summary.totalQuantity += inputQuantity;

            } else {
                cart[productId].quantity++;
                plusPrice = cart[productId].price;
                cart[productId].productTotal += plusPrice;
                summary.subTotal += plusPrice;
                summary.totalQuantity++; 

            }
        } else {
            rows.forEach((item) => {
                if (item.discount > 0 ) {
                    price = item.discount;
                } else {
                    price = item.price;
                }
                cart[productId] = {
                    id : item.id,
                    name : item.name,
                    color : item.color,
                    image : item.image,
                    category : item.categoriesName,
                    price : price,
                    discount : item.discount,
                };
                if (req.body.quantity) {
                    cart[productId].quantity = inputQuantity;
                    plusPrice = cart[productId].price * inputQuantity;
                    cart[productId].productTotal += plusPrice;
                    summary.subTotal += plusPrice;
                    summary.totalQuantity += inputQuantity;

                } else {
                    cart[productId].quantity = 1;
                    plusPrice = cart[productId].price;
                    cart[productId].productTotal = plusPrice;
                    summary.subTotal += plusPrice;
                    summary.totalQuantity++; 
                };     
            });
            // console.log(cart[productId]);
        };
        summary.total = summary.subTotal - summary.shipping;

        res.redirect('/users/cart');
        // console.log(cart.id);
    });
};



exports.getCheckout = (req,res) => {
    if (req.session.userID) {
        if (req.session.cartSummary) {
            // console.log(req.session.userID);
            let id  = req.session.userID;
            // console.log(typeof(id));
            req.session.address = {};
            db.query('SELECT * FROM addresses WHERE user_id = ?;', [id], (err,result) => {
                // console.log(result[0].user_id);
                req.session.address = result[0];
                // console.log(req.session.address);
                if(result[0]) {
                    return res.render('checkout', {
                        address: req.session.address,
                        cart : req.session.showCart,
                        cartSummary : req.session.cartSummary,
                    });
                   
                } else {
                    return res.render('checkout', {
                        address : '',
                        cart : req.session.showCart,
                        cartSummary : req.session.cartSummary,
                    });
                };
            });
            // console.log(req.session.showCart);
            // console.log(req.session.cartSummary);
        } else {
            return res.redirect('/users/cart');
        }
    } else {
        return res.render('login-register', {
            err_message: "กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ"
        });
    };
};

exports.postCheckout = async (req,res) => {
    let user = req.session.userID;
    let showCart = req.session.showCart;
    let cartSummary = req.session.cartSummary;
    let address = req.session.address;
    // console.log(req.file);

    // console.log(address);
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
        // console.log(errors);
        const alert = errors.array();
        res.render('checkout', {
            alert,
            cart : showCart,
            cartSummary : cartSummary,
            user : user,
            summary : req.session.summary,
            address : address
        });
    } else if (!req.file) {
        req.flash('error', 'กรุณาแนบสลีปการโอนเงิน');
        res.redirect('/users/checkout');
    } else {
        const { fullName, streetAddress, subdistrict, district, province, postcode, tel, note } = req.body;
        if (!address) {
            db.query('INSERT INTO `addresses` SET ?', {
                user_id : user,
                full_name : fullName,
                street_address : streetAddress,
                sub_district :subdistrict,
                district: district,
                province: province,
                postcode: postcode,
                tel : tel
            });
        } else {
            db.query('UPDATE addresses SET ? WHERE user_id = ?',[{
                full_name : fullName,
                street_address : streetAddress,
                sub_district :subdistrict,
                district: district,
                province: province,
                postcode: postcode,
                tel : tel
            }, user]);
        };
        const image = await cloudinary.uploader.upload(req.file.path);
        // showcart เก็บที่ order detail
        // cartSummary เก็บที่ orders เดี๋ยวลืมอีก
        const nDate = new Date().toLocaleString('en-US', { timeZone: 'Asia/Bangkok', hour12: false }).replace(',','');
        // console.log(nDate);
        db.query('INSERT INTO orders SET ?', {
            user_id : user,
            sub_total : cartSummary.subTotal,
            shipping : cartSummary.shipping,  
            Total : cartSummary.total,
            OrderDate : nDate ,
            note : note,
            payment_img : image.url,
        },(err,result) => {
            if(result){
                for (let items in showCart) {
                    let item = showCart[items];
                    db.query('INSERT INTO `order details` SET ?', {
                        order_id : result.insertId,
                        product_id : item.id,
                        quantity : item.quantity,
                        price : item.price,
                        total : item.productTotal,
                    });
                };
            };
        });
        delete req.session.cart;
        delete req.session.summary;
        res.render('success', {
            user : user
        });

    };
};
