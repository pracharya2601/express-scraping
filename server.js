const express = require("express");
const app = express();

app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser());
app.use(express.static(__dirname + '/public'));

const cheerio = require("cheerio");

const mongojs = require("mongojs");

const databaseUrl = "scraper";
const collections = ["scrapedData"];

const request = require("request");

const db = mongojs(databaseUrl, collections);


db.on("error", function (error) {
    console.log("Database Error:", error);
});

function updateDb(title, link, content, image) {
    db.scrapedData.update(
        { Title: title, Link: link },
        { $set: { Title: title, Link: link, Content: content, Image: image } },
        { upsert: true },
    );
};


app.post("/deleteComment", function (req, res) {
    let comment = req.body.comment;
    let id = req.body.id;
    db.scrapedData.update({ "_id": mongojs.ObjectID(id) }, { $pull: { Comments: comment } }, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            res.redirect("/savedArticles");
        }
    });
});

// app.post("/deleteArticle", function(req,res){
//     let id = req.body.id;
//     db.scrapedData.remove({_id: mongojs.ObjectID(id)}, function(error, result){
//         if (error){
//             console.log(error);
//         } else {
//             res.redirect("/savedArticles");
//         }
//     });
// })

// app.post("/saveArticle", function (req, res) {
//     var image = req.body.image;
//     var title = req.body.title;
//     var link = req.body.link;
//     var content = req.body.content;
//     updateDb(title, link, content, image);
// });

// app.get("/savedArticles", function (req, res) {
//     db.scrapedData.find(function (error, result) {
//         res.render("savedArticles", { results: result });
//     });
// });

app.post("/addComment", function (req, res) {
    var id = req.body.id;
    var comment = req.body.newComment;
    db.scrapedData.update({ "_id": mongojs.ObjectID(id) }, { $push: { Comments: comment } }, function (error, response) {
        if (error) {
            console.log(error)
        }
    });
    res.redirect("/savedArticles");
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    request.get("https://www.nbcbayarea.com/news/local/making-it-in-the-bay/", function (err, response, body) {
        var $ = cheerio.load(body);
        var results = [];
        $("h3.story-card__title").each( function (i, element) {
            var img = $(element).parent().parent().children().eq(0).children().children().children().attr("src");
            var title = $(element).text();
            var link = $(element). children().eq(0).attr("href");
            var content = $(element).parent().parent().children().eq(1).text();
            if (link[0] == "/") {
                link = "https://www.nbcbayarea.com" + link;
            }
            if (content != "")
                results.push({ Title: title, Link: link, Content: content, Image: img });
        });



        res.render("index", { results: results });
    });
});

app.listen("3000", function () {
    console.log("Server running on 3000");
});