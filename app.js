const express = require("express");
const cors = require("cors");
const app = express();
// const db = require("./models");
// db.sequelize.sync();
// parse requests of content-type - application/json
app.use(express.json());



app.use('/', require('./routes/index')); 
module.exports=app