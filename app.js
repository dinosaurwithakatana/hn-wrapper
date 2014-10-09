var request = require('request');
var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var get = Rx.Observable.fromNodeCallback(request);
var getTopStories = function(maxStories){
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
    .take(maxStories)       //take the max
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
                console.log(x.title);
            },
            function (err) {
                console.log('Error:  ' + err);
            },
            function () {
                console.log('Complete');
            }
    );
}

function getComments(parentStoryID, startDepth, endDepth)
{
	// request parent story
	// grab 'kids' field from parent story response
	// the field from part 2 contains depth 0 comments
	// for each kid, request the item and recurse as far as endDepth param specifies
	console.log(getItem(parentStoryID));
}

function getItem(itemID)
{
	get(rootUrl+version+'/item/'+itemID+'.json')
	.map(function(res){
		return res[1]
	})
	.subscribe(
		function(rawJSON){
			console.log('RAW JSON')
			return JSON.parse(rawJSON)
		},
		function(error){
			console.log('ERROR')
			return err
		}
	);
}

//getTopStories(10);
getComments('8863', 0, 0)

