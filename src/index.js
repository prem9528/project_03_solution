const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const route = require('./routes/route');
const multer= require("multer");
const app = express();
const { AppConfig } = require('aws-sdk');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( multer().any())

mongoose.connect("mongodb+srv://uranium:uranium@cluster0.pgmlm.mongodb.net/group49Database").then(() => console.log("MongoDB Is Connected")).catch(err => console.log(err));

app.use('/', route);

app.listen(process.env.PORT || 3000, function () {
    console.log('Express App Is Running On Port ' + (process.env.PORT || 3000))
});