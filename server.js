const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
const client = require('./server/connection');

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

client.cluster.health({}, function (err, resp, status) {
    console.log("-- Client Health --", resp);
});


app.get('/create', (req, res) => {
    client.indices.create({
        index: 'site_record'
    }, function (err, resp, status) {
        if (err) {
            console.log(err);
        } else {
            console.log("create", resp);
            res.send('created')
        }
    });
});

app.get('/add', (req, res) => {
    client.index({
        index: 'site_record',
        type: 'events',
        body: {
            "Site": "TestSite",
            "SessionNumber": "AKSU788222",
            "TimeStamp": 1234567,
            "EventName": "mousemove",
            "EventData": "Borough"
        }
    }, function (err, resp, status) {
        console.log(resp);
        res.send('added')
    });
});


app.get('/delete', (req, res) => {
    client.indices.delete({index: 'site_record'}, function (err, resp, status) {
        console.log("delete", resp);
        res.send('delited')
    });
});

app.get('/count', (req, res) => {
    client.count({index: 'site_record', type: 'events'}, function (err, resp, status) {
        console.log("site_record", resp);
        res.send('site_record' + resp)
    });
});

app.get('/get_events', (req, res) => {
    client.search({
        index: 'site_record',
        type: 'events',
        body: {
            query: {
                match: { "Site": "TestSite" }
            },
        }
    },function (error, response,status) {
        if (error){
            console.log("search error: "+error)
        }
        else {
            console.log("--- Response ---");
            res.send('site_record' + JSON.stringify(response.hits.hits));
            console.log(response);
            console.log("--- Hits ---");
            response.hits.hits.forEach(function(hit){
                console.log(hit);
            })
        }
    });
})

app.get('/', (req, res) => res.send('Hello World!'))
app.get('/event', (req, res) => {
    fs.appendFile("test.txt", req.query.ts + ', ' + req.query.name + ': ' + req.query.data+'\n', function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))