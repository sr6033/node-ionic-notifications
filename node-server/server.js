'use strict'

const express = require('express');
const app = express(),
    request = require('request'),
    mongo = require('mongodb'),
    bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017/DATABASE_NAME';
const dbName = 'notifier_db';

app.post('/store', (req, res) => {

    console.log(req.body);

    MongoClient.connect(url, (err, client) => {
        if (err) throw err;
        else {
            let db = client.db(dbName);
            db.collection('tokens').insertOne(req.body, (err, body) => {
                if (err) throw err;
                res.status(200).send('');
            })
        }
        client.close();
    });
});

var FCM = require('fcm-node');
var serverKey = 'ASDAS...'; //put your server key here
var fcm = new FCM(serverKey);

app.get('/', (req, res) => {
    res.send('Notifications Test');
});

app.get('/send', function(req, res) {

    var token_array = [];

    MongoClient.connect(url, (err, client) => {
        if (err) throw err;
        else {
            let db = client.db(dbName);
            db.collection('tokens').find().toArray((err, docs) => {
                if (err) throw err;
                for(let i = 0; i < docs.length; i++) {
                    token_array.push(docs[i]);
                }
            });
        }
        client.close();
    });

    for(let i = 0; i < token_array.length; i++) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: token_array[i].token,
            // collapse_key: 'your_collapse_key',

            notification: {
                title: 'Title of your push notification',
                body: 'Body of your push notification'
            },

            data: {  //you can send only notification or only data(or include both)
                my_key: 'my value',
                my_another_key: 'my another value'
            }
        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }

    res.send('send msg');
});


app.listen(3000, () => console.log('Notifier listening on port 3000!'));