'use strict'
var sqlite3 = require('sqlite3').verbose();
var file = "data.db";
var db = new sqlite3.Database(file); //storing it in a file
var fs = require("fs");


module.exports = {
    createTables : function () {
        var exists = fs.existsSync(file);
        try { //trying to read in the file
            var createDB = fs.readFileSync('database.sql', 'utf8');
        }
        catch (err) { //no SQL file is given
            if (!exists) { //if we don't already have a database with tables in this is a problem
                console.log("create db error");
            return 0;
            }
            else return 1; //it is sort of a success as we don't even need to create any tables
        }
        if (!exists) {
            console.log("Creating DB file.");
            fs.openSync(file, "w");
            console.log("Done");
        }
        db.exec(createDB);
        return 1;
    },
    showTable : function() {
        console.log('student table is: ');
        db.each("SELECT UserID, UserEmail, Password FROM User", function(err, row) {
            if (err) {
                console.log('showTable error');
            }
            else  {
                console.log(row);
            }
        });
    },
    verifiy : function(data, callback) {
        db.get("SELECT UserID, UserEmail FROM User WHERE UserEmail = ? AND Password = ?", data.email, data.password, function(err, row) {
            if (err)
                console.log("verify error, either no such user or database error");
            else {
                console.log(row);
                callback(row);
            }
        });
    },
    getAllData : function(callback) {
        var people = [];
        db.each("SELECT UserID FROM User", function(err, row) {
            if(err){
                console.log('getAllData error');
            }else{
                var person = {id:row.UserID};
                people.push(person);
            }
            },function(err, numRows) {
                if (err) {
                    console.log('getAllData error');
                }
                else callback(people);
        });
    },
    getEmail : function(data, callback) {
        db.get("SELECT UserEmail FROM User WHERE UserID = ?", data, function(err, row) {
            if (err)
                console.log("get error");
            else {
                // console.log(row);
                callback(row.UserEmail);
            }
        });
    },

    insertUser : function (values, callback) {
        var stmt;
        stmt = db.prepare("INSERT INTO User (UserEmail, Password) VALUES (?,?)");
        stmt.run(values.email, values.password, callback);
    }
}
