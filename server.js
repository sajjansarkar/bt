console.log('May Node be with you');
const path = require('path');
const express = require('express');
const app = express();
console.log('May Node be with you');
const path = require('path');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
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
var db;
MongoClient.connect('mongodb://admin:ohyeah@ds013926.mlab.com:13926/btdb', (err, database) => {
    if (err) return console.log(err)
    db = database
    app.listen(3000, () => {
        console.log('listening on 3000')
    })
})

app.use(express.static('public'));
app.get('/', (req, res) => {

    res.sendFile(__dirname + '/home/index.html')
        // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
        // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
app.get('/movies', (req, res) => {

    res.sendFile(__dirname + '/view/movies.html')
        // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
        // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
app.post('/movies', (req, res) => {

    console.log(req.body);
    db.collection('movies').insertMany(JSON.parse(req.body.allMovies), (err, result) => {
        if (err) return console.log(err)

        console.log('saved to database')
        res.redirect('/movies')
    })

    // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
    // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
const bodyParser= require('body-parser');
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
app.use(bodyParser.json({limit: '50mb'}));
/**
mongodb
*/
const MongoClient = require('mongodb').MongoClient
var db;
MongoClient.connect('mongodb://admin:ohyeah@ds013926.mlab.com:13926/btdb', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(3000, () => {
    console.log('listening on 3000')
  })
})

app.use(express.static('public'));
app.get('/', (req, res) => {

  res.sendFile(__dirname + '/home/index.html')
  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
app.get('/movies', (req, res) => {

  res.sendFile(__dirname + '/view/movies.html')
  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
app.post('/movies', (req, res) => {

  console.log(req.body);
  db.collection('movies').insertMany(JSON.parse(req.body.allMovies), (err, result) => {
    if (err) return console.log(err)

    console.log('saved to database')
    res.redirect('/movies')
  })

  // Note: __dirname is the path to your current working directory. Try logging it and see what you get!
  // Mine was '/Users/zellwk/Projects/demo-repos/crud-express-mongo' for this app.
})
