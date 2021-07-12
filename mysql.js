require('dotenv/config');
const mysql = require('mysql2');
var pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB,
    dateStrings: true,
    waitForConnections : true,// 無可用連線時是否等待pool連線釋放(預設為true)
    connectionLimit : 10 // 連線池可建立的總連線數上限(預設最多為10個連線數)
});

// pool.getConnection(function(err, connection){
//     if(err){
//         console.log(err);
//     } else {
//         connection.query('select * from Users', (err, rows)=>{
//             console.log(rows)
//             connection.release();
//         })
//     }
// })



const query = ((sql, cb)=>{
    pool.getConnection((err, conn)=>{
        if(err){
            cb(err, null,null);
        } else {
            conn.query(sql,(qerr,vals,field)=>{
                conn.release();
                cb(qerr, vals, field);
            });
        }
    })
});

module.exports= query;