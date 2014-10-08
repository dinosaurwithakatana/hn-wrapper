var request = require('request');
var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var get = Rx.Observable.fromNodeCallback(request);

var getTopStories = function(maxStories){
    get(rootUrl + version + '/topstories.json')
    .map(function(res){
        return res[1];
     })
    .map(function(res){
        return JSON.parse(res);
    })
    .map(function(res){
        return res.slice(0, maxStories);
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
