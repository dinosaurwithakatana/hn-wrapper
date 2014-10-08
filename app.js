var Firebase = require('firebase');
var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'
var myRootRef = new Firebase(rootUrl + version);

var topStories = [];
//myRootRef.child('/topstories').on("value", function(snapshot){
    //for(var i = 0; i< snapshot.val().length; i++){
        //myRootRef.child('/item/'+snapshot.val()[i]).on("value", function(story){
            //topStories[topStories.length] = story.val();
        //});
    //}
//})
//
//
//
var requestStream = Rx.Observable.returnValue(rootUrl+version);
requestStream.subscribe(function(requestUrl){
    var responseStream = Rx.Observable.create(function (observer) {
        jQuery.getJSON('/topstories')
            .done(function (response) { observer.onNext(response); })
            .fail(function(jqXHR, status, error) { observer.onError(error); })
            .always(function() {observer.onCompleted(); })
    });

    responseStream.subscribe(function (data){
        console.log(data);
    });

});
