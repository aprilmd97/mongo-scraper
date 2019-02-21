
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var TweetSchema = new Schema ({
    
    tweet: {
        type: String,
        required: true
    }
});

var Tweet = mongoose.model("Tweet", TweetSchema);

module.exports= Tweet;