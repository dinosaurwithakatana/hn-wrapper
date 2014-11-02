var restify = require('restify');
var request = require('request');
var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var get = Rx.Observable.fromNodeCallback(request);

function getTopStories(req, res, next){
    var topStories = [];
    var fromStory = req.query.fromStory;
    var toStory = req.query.toStory;
    if(!fromStory){
        fromStory = 0;
    }

    if(!toStory){
        toStory = 100;
    }

    get(rootUrl + version + '/topstories.json')
    .map(function(res){
        return res[1];  // get the body
     })
    .map(function(res){
        return JSON.parse(res);     //turn it into a object
    })
    .flatMap(function(res) {
        return Rx.Observable.fromArray(res);    //map each of the story item ids into an observable
    })
    .skip(fromStory)
    .take(toStory)       //take the max
    .flatMap(function(res){
        return get(rootUrl + version + '/item/' + res + '.json');   // make the details call on each response
    })
    .map(function(res){
        return res[1];  // get the body     
     })
    .map(function(res){
        return JSON.parse(res);     //turn it into a object
    })
    .subscribe(
            function (x) {
                topStories[topStories.length] = x;
            },
            function (err) {
                console.log('Error:  ' + err);
            },
            function () {
                res.send(topStories);
            }
    );
}

function getComments(parentStoryID, depth){
    if (depth == -1)
        return Rx.Observable.empty()
    return getItemKids(parentStoryID)    
            .flatMap(function(kidID){        
                if (!kidID)
                    return Rx.Observable.empty()
                return getItem(kidID)
                        .flatMap(function(parsedJSON){
                            return getComments(parseInt(parsedJSON.id), depth--)
                        })
            })
}

function getItemKids(itemID){
	return getItem(itemID)
            .filter(function(json){
                return json != null
            })
			.map(function(parsedJSON){                    
				var kids = parsedJSON['kids']
				return kids;
			})
            .filter(function(kids){
                return kids != null
            })
			.flatMap(function(kids){
				return Rx.Observable.fromArray(kids)
			})
}

function getItem(itemID){
	return get(rootUrl+version+'/item/'+itemID+'.json')
		.map(function(res){
			return res[1];
		})
        .filter(function(element){
            return element != null;
        })
		.map(function(rawJSON){
			return JSON.parse(rawJSON);
		})
}

function full_getComments(storyID, depth){
    // get the root parentStory
    var comments;
    return getItem(storyID)
        .subscribe(
            function(onNextValue){
    
                },
            function(error){

            },
            function(){

            }
        )
}

console.log(full_getComments('8863', 3))
// getComments('8863', 3)
// 		    .subscribe(
// 		    	function(onNextValue){
//                      // console.log(onNextValue)
// 		    	},
// 		    	function(error){
// 		    		console.log("Error: "+error)
// 		    	},
// 		    	function(){
// 		    		console.log("Complete")
// 		    	}
// 		    )

//server.get('/getTopStories', getTopStories); 
//var port = process.env.PORT || 5000;
//server.listen(port, function () {
//  console.log('%s listening at %s', server.name, server.url);
//});
