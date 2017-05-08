'use strict'
var Imap = require('imap'),
    inspect = require('util').inspect;
var nodemailer = require('./receiver.js');
const simpleParser = require('mailparser').simpleParser;
var fs = require('fs');
var imap = new Imap({
  user: 'leg.project.test@gmail.com',
  password: 'qwe123456',
  host: 'imap.gmail.com',
  port: 993,
  tls: true
});

function openInbox(cb) {
  imap.openBox('INBOX', false, cb);
}

var inbox;

imap.on('mail', function(numNewMsgs){
    var results = imap.seq.search(['UNSEEN'], function(err, uids) {
        if (err) {
            console.log("mail search error: " + err);
        }
        else {
            console.log(uids);
            if (uids.length > 0) {
                var fetch = imap.seq.fetch(uids, {
                    markSeen: true,
                    bodies: ''
                });
                fetch.on('message', function(msg, seqno) {
                    msg.on('body', function(stream, info) {
                        simpleParser(stream, function(err, mail) {
                            var body = mail.text.split(">");
                            var reply = mail.text.split(">")[0].toLowerCase().trim();
                            console.log(body);
                            var id = 0;
                            for (var line of body) {
                                if (line.indexOf("ID") != -1) {
                                    id = parseInt(line.split(":")[1].trim());
                                    break;
                                }
                            }
                            // var from = mail.from.value[0].address;
                            if (reply.indexOf("yes") != -1) {
                                fs.readFile('contactList.json', 'utf8', function (err, data){
                                    if (err) {
                                        console.log("readFile error: " + err);
                                    }
                                    else {
                                        var contactList = JSON.parse(data);
                                        var list = contactList.contactList.filter(function(contact){
                                            if (contact.id == id) {
                                                console.log(contact);
                                                nodemailer.sendReplyMail(contact);
                                            }
                                            return contact.id != id;
                                        });
                                        // console.log(list);
                                        fs.writeFile('contactList.json', JSON.stringify({"contactList":list}), 'utf8', function(){}); // write it back
                                    }
                                });
                            }
                        });
                    });
                });
            }
        }
    });
});


imap.once('ready', function() {
  openInbox(function(err, box) {
      if (err) {
          console.log("open inbox error");
      }
  });
});

imap.connect();
