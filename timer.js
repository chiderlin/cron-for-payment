const schedule = require('node-schedule');
const mysql = require('mysql2');
const axios = require('axios');
const moment = require('moment');
require('dotenv/config');
const query = require('./mysql.js');
let format_today;
let next_pay_date;
let count = 0;




const cronjob = schedule.scheduleJob('0 0 10 * * ?',()=>{ // 每天10:00執行一次
    
    let today = moment();
    format_today = today.format('YYYY-MM-DD');
    next_pay_date = today.add(1, 'days').format('YYYY-MM-DD'); // 測試先加一天
    console.log(format_today);
    // const db = mysql.createConnection({
    //     host: process.env.DB_HOST,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PWD,
    //     database: process.env.DB,
    //     dateStrings: true,
    // });
    // db.connect()
    // console.log('Connected!');
    const sql = `select * from Payments where next_pay_date = "${format_today}"`;
    query(sql, (err,res,field)=>{
        if(err){
            throw err;
        } else {
            for(let i=0; i<res.length; i++) {
                // console.log("card_key:",res[i].card_key)
                // console.log(res[i].card_token)
                const paymentId = res[i].id;
                const card_key = res[i].card_key
                const card_token = res[i].card_token;
                const userId = res[i].UserId;
                let plan;
                const sql = `select plan from Users where id=${userId}`;
                query(sql,(err,res,field)=>{
                    if(err){
                        throw err;
                    } else {
                        plan = res[0].plan;
                    }
                    const post_data = {
                        'card_key':card_key,
                        'card_token':card_token,
                        'partner_key': 'partner_PyJKIbMCqgsYpYiouacHI67J0jT0xOdGBGSO9e05OdiB1RHhYSDdjioD',
                        'merchant_id': 'chi_CTBC',
                        'currency': 'TWD',
                        'amount': plan,
                        'details': 'pay gym service monthly',
                    }
                    payByToken(post_data,paymentId);
                })
            }
        }
    })
    // db.query(sql,(err,res)=>{
    //     if(err){
    //         throw err;
    //     } else {
    //         for(let i=0; i<res.length; i++) {
    //             // console.log("card_key:",res[i].card_key)
    //             // console.log(res[i].card_token)
    //             const paymentId = res[i].id;
    //             const card_key = res[i].card_key
    //             const card_token = res[i].card_token;
    //             const userId = res[i].UserId;
    //             let plan;
    //             const sql = `select plan from Users where id=${userId}`;
    //             db.query(sql,(err,res)=>{
    //                 if(err){
    //                     throw err;
    //                 } else {
    //                     plan = res[0].plan;
    //                 }
    //                 const post_data = {
    //                     'card_key':card_key,
    //                     'card_token':card_token,
    //                     'partner_key': 'partner_PyJKIbMCqgsYpYiouacHI67J0jT0xOdGBGSO9e05OdiB1RHhYSDdjioD',
    //                     'merchant_id': 'chi_CTBC',
    //                     'currency': 'TWD',
    //                     'amount': plan,
    //                     'details': 'pay gym service monthly',
    //                 }
    //                 payByToken(post_data,paymentId);
    //             })
    //         }
    //     }
    // })
});



function payByToken(post_data,paymentId){
    const url = 'https://sandbox.tappaysdk.com/tpc/payment/pay-by-token'
    axios.post(url, post_data, {
        headers:{
            'Content-Type':'application/json',
            'x-api-key': post_data.partner_key
        },
    }).then((result)=>{
        console.log(result.data);
        const data = result.data;
        if(data.status === 0) { //付款成功
            const transaction_id = data.bank_transaction_id;
            const amount = data.amount;
            const currency = data.currency;
            const rec_trade_id = data.rec_trade_id;
            // 把其他資料存到order db
            insert_order(transaction_id,amount,currency,rec_trade_id, paymentId, (ok)=>{
                // 更新付款時間到payments => next pay date
                // const db = mysql.createConnection({
                //     host: process.env.DB_HOST,
                //     user: process.env.DB_USER,
                //     password: process.env.DB_PWD,
                //     database: process.env.DB,
                //     dateStrings: true,
                // });
                // db.connect()
                const sql = `update Payments set next_pay_date = "${next_pay_date}" where next_pay_date = "${format_today}"`
                query(sql,(err,res,field)=>{
                    if(err) {
                        throw err;
                    }
                    count++;
                    console.log(count + 'record(s) updated');
                })
                // db.query(sql, (err,result)=>{
                //     if(err) {
                //         throw err;
                //     }
                //     count++;
                //     console.log(count + 'record(s) updated');
                //     db.end();
                // })
            })    
        }
    })
};

function insert_order(transaction_id,amount,currency,rec_trade_id, paymentId, callback){
    // const db = mysql.createConnection({
    //     host: process.env.DB_HOST,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PWD,
    //     database: process.env.DB,
    //     dateStrings: true,
    // });
    // db.connect()
    const sql = `insert into Orders(transaction_id, currency, amount,rec_trade_id, paymentId) value ('${transaction_id}','${currency}','${amount}','${rec_trade_id}','${paymentId}')`
    query(sql,(err,res,field)=>{
        if(err){
            throw err;
        } else {
            return callback('insert 1 record');
        }
    })
    // db.query(sql, (err, result)=>{
    //     if(err){
    //         throw err;
    //     } else {
    //         return callback('insert 1 record');
    //     }
    // })
}