console.log('May Node be with you');
const path = require('path');
const express = require('express');
const app = express();
require('dotenv').config();
const bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var hbs = exphbs.create({ /* config */ });

// Register `hbs.engine` with the Express app.
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');
/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json({
    limit: '50mb'
}));
/**
mongodb
*/
const MongoClient = require('mongodb').MongoClient
var ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect(process.env.CONN_STRING, (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

app.use(express.static('public'));



app.get('/', (req, res) => {
    console.log(process.env.CONN_STRING);
    res.send("HomePageHere!");
});
app.get('/scraper', (req, res) => {
    console.log(process.env.CONN_STRING);
    res.sendFile(__dirname + '/scraper/index.html')
});
app.get('/movies/year/:year/cards/:noofcards/exclude/:excludeids', (req, res) => {
    var sd = parseInt(req.params.year);
    var ed = sd + 10;
    var start = new Date((new Date("1/1/" + sd)).toISOString());
    var end = new Date((new Date("1/1/" + ed)).toISOString());

    var excludeArray = [];

        var ids = req.params.excludeids.split(",");

        for (id of ids) {
          console.log("objing :"+id);
          if(id!="0")
            excludeArray.push(ObjectId(id))
        }


    //  var x = '["' + req.params.excludeids.replace(/,/g, '","') + '"]';




    var filter = {
        ReleaseDateISO: {
            '$gte': start,
            '$lt': end
        },
        _id: {
            '$nin': excludeArray
        }
    };
    console.log(filter);
    db.collection('movies').find(filter).limit(parseInt(req.params.noofcards)).toArray((err, result) => {
        if (err) return console.log(err);
        res.send(result);

    })

})
app.get('/btaboo', (req, res) => {

    res.sendFile(__dirname + '/btaboo/setup.html')

})
app.get('/btaboo/:decade', (req, res) => {
    res.render('btgame', req.params);

})
app.post('/scraper/save', (req, res) => {


    db.collection('movies').drop();
    var movieList = JSON.parse(req.body.allMovies);
    for (var i = 0; i < movieList.length; i++) {
        try {
            movieList[i].ReleaseDateISO = new Date(movieList[i].ReleaseDate);
        } catch (e) {
            movieList[i].ReleaseDateISO = 00;
        }
    }
    //  console.log(req.body.allMovies);
    db.collection('movies').insertMany(movieList, (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.send({
            status: "success"
        });
    })

})
