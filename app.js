var Rx = require('rx');
var rootUrl = 'https://hacker-news.firebaseio.com';
var version = '/v0'

var topStories = [];
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
