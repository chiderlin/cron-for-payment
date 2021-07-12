const query = require('./mysql.js');

query('select * from Users', (err, vals, field)=>{
    console.log(vals);
})