//dependencies
var express = require("express");

var exphbs = require("express-handlebars");

var path = require("path");

var mongoose = require("mongoose");
var logger = require("morgan");

var Tweet = require("./models/Tweet.js");

//scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

//set mongoose

//This code should connect mongoose
//to your remote mongolab database if deployed, but otherwise will connect to
//the local mongoHeadlines database on your computer
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

var dtb = mongoose.connection;

dtb.on("error", function (error) {
    console.log("Database Error:", error);
});

dtb.once("open", function () {
    console.log("Mongoose connection was successful.");
});


//requiring the model for accessing the collection
//var ...

//defining port
var PORT = process.env.PORT || 8080;

//initializing express
var app = express();

//handlebars
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));

app.set("view engine", "handlebars");



//using morgan logger for logging requests
app.use(logger("dev"));

//parsing request body as json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//making 'public' static 
app.use(express.static("public"));

//get requests

app.get("/scrape", function (req, res) {

    axios.get("https://mobile.twitter.com/realDonaldTrump/").then(function (response) {
        var $ = cheerio.load(response.data);

        //grabbing just the text of the tweet
        $(".tweet-text").each(function (i, element) {

            var results = {};
            results.tweet = $(element).text();

            var donaldTweet = new Tweet(results);

            donaldTweet.save(function (err, inserted) {
                if (err) {
                    // Log the error if one is encountered during the query
                    console.log(err);
                }
                else {
                    // Otherwise, log the inserted data
                    console.log(inserted);
                }

            });


        });

    })

    res.send("Scrape Complete");
});

app.get("/", function (req, res) {
    Tweet.find({}, function (error, data) {

        var handlebarsObj = {
            tweet: []
        };

        for (var i = 0; i < data.length; i += 1) {
            var theTweet = data[i].tweet;

            handlebarsObj.tweet.push(theTweet);
        }


        res.render("this", handlebarsObj);

    });
});



app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});


