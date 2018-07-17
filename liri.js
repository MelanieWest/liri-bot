//keys are saved here
require("dotenv").config();

// Import the Twitter NPM package.
var Twitter = require("twitter");

// Import the node-spotify-api NPM package.
var Spotify = require("node-spotify-api");

// Import the API keys
var keys = require("./keys");

// Import the request npm package.
var request = require("request");

// Import the FS package for read/write.
var fs = require("fs");

// Initialize the spotify API client using our client id and secret
var spotify = new Spotify(keys.spotify);


var command = "";

var input  = "";
var title  = "";
var song   = "";
var dataArray = [];
var outputDataArray = [];


// //console.log(keys);

// var consumer_key = keys.consumer_key;
// var consumer_secret = keys.consumer_secret;
// var access_token_key = keys.access_token_key;
// var access_token_secret = keys.access_token_secret;

switch (process.argv.length){
    case 2:     // no command or input entered

        console.log(" Since you didn't enter a command, we will default to the command on file: ")
        fs.readFile("random.txt","utf8",(error,data)=>{
            if (error) {
            throw error;
            }
            dataArray = data.split(",");
            command = dataArray[0];
            input = dataArray[1];
    
            console.log(command,input);
            getData(command,input);
        });
        
        break;

    case 3:     // command entered without input

        command = process.argv[2]; 

        if (command == 'movie-this'){
            input = "Mr Nobody";
        }else if (command =='spotify-this-song'){
            input = "The Sign";
        }

        console.log("Using default values...")
        console.log(command,input);
        getData(command,input);

        break;

    default:        // 4 or more (song or movie name included;
                    // possibly with multi-word title)

        command = process.argv[2]; 
                    
        for (var i =3; i < process.argv.length; i++){
            input += process.argv[i]+' ';
        }
        input = encodeURIComponent(input);

        console.log(command,input);
        getData(command,input);
        
        break;

}



function getData(command, input){

switch (command) {
    case 'my-tweets':

       console.log('tweets');

       var client = new Twitter(keys.twitter);
        
       var params = {screen_name: 'TalkToTheDuck3'};

       client.get('statuses/user_timeline', params, function(error, tweets, response) {
         if (!error) {
          // console.log(tweets);
           for (i=0; i< tweets.length;i++){
               console.log(tweets[i].text);
               outputDataArray.push(tweets[i].text);
               
           }
           
           fs.appendFileSync("outputData.txt", outputDataArray+ ' \n', "UTF-8",{'flags': 'a+'});
           
         }
       });

        break;

    case 'spotify-this-song':

        console.log('spotify');
        song = input;

        // show:  artist, song name, preview link, origin album name
        // default to data for 'The Sign' by Ace of Base
;       
       var spotify = new Spotify(keys.spotify);

        //do 1 search and find all 3 parameters

        console.log('Song: ',song);

        spotify.search({ type: 'album', query: song, limit: 1 }, function(err, data) {

        if (err) {
              return console.log('Error occurred: ' + err);
        }       
            // console.log(JSON.stringify(data, null, 2));
             var artist = data.albums.items[0].artists[0].name;
             var album  = data.albums.items[0].name;
             var trackUrl = data.albums.items[0].href;

             console.log ('artist: ',artist);
             outputDataArray.push(artist);
             console.log ('album: ',album);
             outputDataArray.push(album);
             console.log ('track: ',trackUrl);
             outputDataArray.push(trackUrl);

             fs.appendFileSync("outputData.txt", outputDataArray+ ' \n', "UTF-8",{'flags': 'a+'});

        });

        break;

    case 'movie-this':

        console.log('movie');
        title = input;

        //default to data for 'Mr. Nobody'
 
        var queryUrl ="http://www.omdbapi.com/?t="+title+"&plot=short&apikey=40e9cece"
        
        // This line is just to help us debug against the actual URL.
        console.log(queryUrl);
        
        // Then create a request to the queryUrl
        request(queryUrl, function (error, response, body) {
          if (error){
            throw error;
          }
          
          // body is a string; parseBody is a JSON object (data-extractable)

          var parseBody = JSON.parse(body);

          //console.log('data: ',parseBody);

          console.log('Title: ',parseBody.Title);
          outputDataArray.push(parseBody.Title); 
          console.log('Year released: ',parseBody.Year);
          outputDataArray.push(parseBody.Year); 
          console.log('Rating: ',parseBody.imdbRating);
          outputDataArray.push(parseBody.imdbRating); 
          console.log('Rotten Tomatoes: ',parseBody.Ratings[1].Value);
          outputDataArray.push(parseBody.Ratings[1].Value); 
          console.log('Country of Origin: ',parseBody.Country);
          outputDataArray.push(parseBody.Country); 
          console.log('Language: ',parseBody.Language);
          outputDataArray.push(parseBody.Language); 
          console.log('Plot: ',parseBody.Plot);
          outputDataArray.push(parseBody.Plot); 
          console.log('Actors: ',parseBody.Actors);
          outputDataArray.push(parseBody.Actors); 

          fs.appendFileSync("outputData.txt", outputDataArray+ ' \n', "UTF-8",{'flags': 'a+'});
                  
        });
        
        break;
    case "do-what-it-says":

        fs.readFile("random.txt","utf8",(error,data)=>{
            if (error) {
            throw error;
            }
            dataArray = data.split(",");
            command = dataArray[0];
            input = dataArray[1];

            console.log(command,input);
            getData(command,input); //recursive call - should get a new command
        });

        break;

    default:
        console.log(" That is an invalid command.  Please try again.")
}
}

// bonus:  create a File.txt that stores everything that is console.logged from here;
// append and don't overwrite

