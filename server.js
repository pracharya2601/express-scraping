//dependencies
var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var request = require("request");

//require axios and cheerio for scraping
var axios = require("axios");
var cheerio = require("cheerio");

//Initialize Express
var app = express();

app.use(bodyParser());
app.use(express.static("views"));

//databse configuration
var databaseUrl = "news";
var collection = ["scrapedNews"];

//Mongojs configuration to the datatbase variables
var db = mongojs(databaseUrl, collection);
db.on("error", function(error) {
    console.log("Database Error:", error);
});

//rendering index page 

app.get("/", function(req, res) {
    res.render("index.html");
});

//retrive data from database 

app.get("/all", function(req, res) {

    db.scrapedNews.find({}, function(error, found) {
        if (error) {
            console.log(error);
        }else {
            res.json(found);
        }

    });
});

// content related to news
function updateDb(title, content, link, comments) {
    db.scrapedNews.update(
        { Title: title, Link: link },
        { $set: { Title: title, Content: content, Link: link, Comments: comments } },
        { upsert: true },
    );
};

// app.post('/insert', function(req,res){
//     console.log(req.body);
//     var array = [];
//     var noArray = [];
//     var userComment = req.body.commentid;
//     for (var i=0; i<userComment.length; i++){
//         if(userComment[i] != ''){
//             array.push(userComment[i]);
//         }
//     }
//     console.log(array);
//     var data = {
//         'comment' : array
//     }
//     db.collection('comments').insertOne(data, function(error,collection){
//         if(error) throw error;
//         console.log('recorded successfully');
//     })
//     res.redirect('/');
        
// });

app.get("/scrape", function(req,res){
    axios.get("https://www.cnn.com/world").then(function(response){
        var $ = cheerio.load(response.data);
        $("span.cd__headline-text").each(function(i, element){
            var title = $(element).text();
            // if (title && link) {
            db.scrapedNews.insert({
                Title: title,
                Content: content,
                Link: link,
                Comments: comments

            }, function(err, inserted){
                if (err) {
                    console.log(err);
                }
                else {
                    console.log(inserted);
                }
                updateDB();
            });
            // }
        });
    });
    res.send("scraping done");
});




//scrape data from news site and placed into mongo db

// app.get("/scrape", function(req, res) {
//     axios.get("https://www.nbcbayarea.com/").then(function(response) {
//         // console.log(response.data);

//     //load html body from axios into cheerio
//     var $ = cheerio.load(response.data)
    

//     })
// })

// app.get("/scrape", function (req, res) {
//     request.get("https://www.foxnews.com/politics", function (err, response, body) {
//         // console.log(response.data);
//         var $ = cheerio.load(body);
//         var results = [];
//         $("h4.title").each(function (i, element) {
//             var img = $(element).parent().parent().parent().children().eq(0).children().eq(0).children().eq(0).attr("src");
//             var title = $(element).text();
//             var link = $(element).children().eq(0).attr("href");
//             var content = $(element).parent().parent().children().eq(1).text();
//             if (link[0] == "/") {
//                 link = "https://www.foxnews.com" + link;
//             }
//             if (content != "")
//                 results.push({ Title: title, Link: link, Content: content, Comments: comments });
//         });



//         res.render("index", { results: results });
//     });
// });






//localhost:3000
app.listen("3000", function () {
    console.log("Server running on 3000");
});