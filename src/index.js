const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')

const route = require('./routes/route.js');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/', route);

mongoose.connect("mongodb+srv://uranium:uranium@cluster0.pgmlm.mongodb.net/group49Database", {useNewUrlParser: true, useFindAndModify: false})
    .then(() => console.log('mongodb running on 27017'))
    .catch(err => console.log(err))

app.listen(process.env.PORT || 3000, function() {
	console.log('Express app running on port ' + (process.env.PORT || 3000))
});