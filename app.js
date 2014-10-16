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

/*var server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());*/

function getComments(parentStoryID, startDepth, endDepth){
	var commentsArr = []
	return Rx.Observable.create(function(observer){
		getItemKids(parentStoryID)
		// have an fromArrayy of observables with subcomment id's
		// get item for the id
		.flatMap(function(item){
			return getItem(item)				
		})
		// flatmap projects function onto each element in arr and returns a single
		// observable sequence 
		.subscribe(
			// onNextValue should have a parsed kids
			// for the parsed item, get the subcomments arr
			function(onNextValue){
				// map each of the elements on kids of 
				if (onNextValue){
					var valKids = onNextValue.kids;
					if (valKids){
						var kidsArr = []					
						valKids.map(function(element){
							var item = getComments(parseInt(element.id), startDepth++, endDepth)
							kidsArr[kidsArr.length] = item
						})	
						// add the onNextValue to commentsArr
						onNextValue.kids = kidsArr;
					}
				}
				commentsArr[commentsArr.length] = onNextValue
				observer.onNext(commentsArr)
			},
			function(error){
				observer.error(error)
			},
			function(){
				observer.onCompleted()
			}
		)
	})
}

function getItemKids(itemID){
	return getItem(itemID)
			.map(function(parsedJSON){
				var kids = parsedJSON['kids']
				return (kids) ? kids : []
			})
			.flatMap(function(kids){
				return Rx.Observable.fromArray(kids)
			})
}

function getItem(itemID){
	return get(rootUrl+version+'/item/'+itemID+'.json')
		.map(function(res){
			return res[1]
		})
		.map(function(rawJSON){
			return JSON.parse(rawJSON)
		})
}

var arr = []
getComments('8863', 0, 2)
	.subscribe(
		function(onNextValue){
			arr = onNextValue;
		},
		function(error){

		},
		function(){
			console.log("Complete")
			arr.map(function(element){
				var kids = element.kids
				if (kids)
					console.log(kids)
			})
		}
	)

//server.get('/getTopStories', getTopStories); 
//var port = process.env.PORT || 5000;
//server.listen(port, function () {
//  console.log('%s listening at %s', server.name, server.url);
//});
