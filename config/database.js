const mysql = require('mysql2');
const dotenv = require("dotenv").config();


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE,
    port: process.env.DATABASE_PORT,
    multipleStatements: true,
  });

  db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("database CONNECTED")
    }
  });

module.exports = db;