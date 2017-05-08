'use strict'
var fs = require("fs");
var nodemailer = require('nodemailer');


// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'leg.project.test@gmail.com',
        pass: 'qwe123456'
    }
});


// send RequestMail
function sendRequestMail(maildata) {
    console.log(maildata);
    var mailOptions = {
        from: '"LEG" <leg.project.test@gmail.com>', // sender address
        to: maildata.target, // list of receivers
        subject: 'Hello', // Subject line
        // text: , // plain text body
        html: sampleRequestMail(maildata) // html body
    };
    transporter.sendMail(mailOptions, function (error, info)  {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

function sampleRequestMail(maildata) {
    var html = "<!DOCTYPE html>\
                <html> \
                    <head>\
                    <meta charset='utf-8'>\
                    <meta name='viewport' content='initial-scale=1.0'> \
                    <meta name='viewport' content='width=device-width, initial-scale=1'> \
                    <title>Request</title>\
                    </head>\
                    <body>\
                    <div>\
                        <b>Hello!</b>\
                        <p>One person wants to contact you!</p>\
                        <p>Do you agree?</p>\
                        <p><b>If you agree, please reply to this email with yes!</b></p>\
                        <p>ID: "+maildata.id+"</p>\
                    </div>\
                    </body>\
                </html>"
    return html;
}

function sendReplyMail(maildata) {
    var mailOptions = {
        from: '"LEG" <leg.project.test@gmail.com>', // sender address
        to: maildata.source, // list of receivers
        subject: 'Hello', // Subject line
        // text: , // plain text body
        html: sampleReplyMail(maildata) // html body
    };
    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

module.exports = {
    sendRequestMail: sendRequestMail,
    sendReplyMail: sendReplyMail,
    storeRecord: storeRecord
}

function storeRecord(maildata, callback) {
      fs.readFile('contactList.json', 'utf8', function (err, data){
          if (err) {
              console.log("readFile error");
          }
          else {
              var contactList = JSON.parse(data);
              if (maildata.source != maildata.target) {
                  var contain;
                  contain = (contactList.contactList.filter(function(contact){
                      return (contact.source === maildata.source ) && (contact.target === maildata.target)
                  }).length > 0);
                  if (!contain) {
                      var lastRecord = contactList.contactList[contactList.contactList.length - 1];
                      var id;
                      if (lastRecord === undefined) {
                          id = 1;
                      }
                      else {
                          id = lastRecord.id + 1;
                      }
                      var newRecord = {source:maildata.source , target:maildata.target, id:id};
                      contactList.contactList.push(newRecord);
                      fs.writeFile('contactList.json', JSON.stringify(contactList), 'utf8', function(){
                          callback(newRecord);
                      }); // write it back
                  }
              }
          }
    });
}

// var test = {source:"420242493@qq.com", target:"ys15162@my.bristol.ac.uk"};

// storeRecord(data, function(maildata) {
//     sendRequestMail(maildata);
// });




function sampleReplyMail(email) {
    var html = "<!DOCTYPE html>\
                <html> \
                    <head>\
                    <meta charset='utf-8'>\
                    <meta name='viewport' content='initial-scale=1.0'> \
                    <meta name='viewport' content='width=device-width, initial-scale=1'> \
                    <title>Request</title>\
                    </head>\
                    <body>\
                    <div>\
                        <b>Hello!</b>\
                        <p>One person agrees to contact you!</p>\
                        <p>This is him/her/ email: "+email+"</p>\
                    </div>\
                    </body>\
                </html>"
    return html;
}
