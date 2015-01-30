// Redis related
var redis = require("redis");
var redisClient;

if (process.env["REDISTOGO_URL"]) {
    // TODO: redistogo connection
	// inside if statement
	var rtg   = require("url").parse(process.env["REDISTOGO_URL"]);
	redisClient = redis.createClient(rtg.port, rtg.hostname);
	redisClient.auth(rtg.auth.split(":")[1]);

} else {
    redisClient = redis.createClient();
}

var Rx = require('Rx');

// Returns an observable for a redis value for a given key
function valueForKey(key){
	return Rx.Observable.create(function(observer){
		redisClient.get(key, function(err, reply){
			if (err)
				observer.error(err);
			else {
				var jsonReply = JSON.parse(reply)
				observer.onNext(jsonReply);
				observer.onCompleted();
			}
		})	
	})
}

// Returns an observable that retuns the value once it's been set in redis
function setValueForKey(key, value){
	return Rx.Observable.create(function(observer){
		var jsonValue = JSON.stringify(value);
		redisClient.set(key, jsonValue, function(error){
			if (error)
				observer.error(error)
			else {
				observer.onNext(value);
				observer.onCompleted();
			}

		});
	})
}

module.exports.valueForKey = valueForKey;
module.exports.setValueForKey = setValueForKey;