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
        return JSON.parse(res);     //turn it into a json object
    })
    .map(function(res){
        return res.slice(0, maxStories);    //slice to requested stories
    })
    .subscribe(
            function (x) {
                console.log(x);
            },
            function (err) {
                console.log('Error:  ' + err);
            },
            function () {
            }
    );
}

getTopStories(5);
