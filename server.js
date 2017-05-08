'use strict'

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var sender = require('./sender.js');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(express.static("public/html"));
var db = require("./dbFunction.js");

app.listen(8080, () => {
    console.log("server starts");
    // db.createTables();
    // db.insertUser({email:"420242493@qq.com", password:"password"}, function(){});
    // db.insertUser({email:"ys15162@my.bristol.ac.uk", password:"password"}, function(){});
    db.showTable();
});

app.get('/:name',  (req, res) => {
    var name = req.params.name;
    if (name == "getAllData") {
        db.getAllData(function(people){
            res.send(people);
        });
    }
});


app.post('/:name',  (req, res) => {
    var name = req.params.name;
    if (name == "login") {
        console.log(name);
        console.log(req.body);
        db.verifiy(req.body, function(data) {
            res.send(data);
        });
    }
    else if (name == "contact") {
        db.getEmail(req.body.target, function(email) {
            sender.storeRecord({target:email, source: req.body.email}, function(data) {
                sender.sendRequestMail(data);
            })
        })
    }
});
