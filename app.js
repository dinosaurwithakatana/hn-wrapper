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

// Have a full comment/story object here...
// properly process the kids array of the comment/story object
function getComments_recursive(commentObject){
    if (!commentObject || !commentObject.kids) 
        return Rx.Observable.empty();

    var idx = 0;
    return Rx.Observable.fromArray(commentObject.kids)
        .filter(function(kidID){
            return kidID != null;
        })
        .flatMap(function(kidID){
            return getItem(kidID)
            .flatMap(function(kidJSON){
                commentObject.kids[idx] = kidJSON;
                idx++;                 
                return getComments_recursive(kidJSON);
            })
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

function full_getComments(storyID){
    // get the root parentStory
    var item;
    return Rx.Observable.create(function(observer){
        getItem(storyID)
        .flatMap(function(parsedItem){
            item = parsedItem;
            return getComments_recursive    (parsedItem)
        })
        .subscribe(
            function(onNextValue){

            },
            function(error){
                observer.onError(error);
            },
            function(){
                observer.onNext(item);
                observer.onCompleted();
            }
        );
    });
}

function getComments(req, res, next){
    var comments;
    var storyID = req.query.storyID;
    if (!storyID)
        res.send('Invalid request (No storyID provided)');
    full_getComments(storyID)
    .subscribe(
        function(onNextValue){
            comments = onNextValue;
        },
        function(error){

        },
        function(){
            res.send(comments.kids);
        }
    );
}

var server = restify.createServer({
  name: 'hn-wrapper',
  version: '1.0.0'
});

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/getComments', getComments);
server.get('/getTopStories', getTopStories); 
server.get(/.*/, restify.serveStatic({
    'directory': '.',
    'default': 'index.html'
}));

var port = process.env.PORT || 5000;
server.listen(port, function () {
 console.log('%s listening at %s', server.name, server.url);
});
