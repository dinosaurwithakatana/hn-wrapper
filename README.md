HN-Wrapper
=========

This is a wrapper around the newly released official Hacker News API. 
It uses RxJS to populate the ids that are returned from the official API with the item details and then returns those created objects.

getTopStories
------
endpoint: `/getTopStories`

optional params: `fromStory`, `toStory`

This call gets the Hacker News top stories page, optional params take integer values for stories to return

**Example**

`http GET http://localhost:5000/getTopStories\?fromStory\=0\&toStory\=2`

This returns the top 2 stories from the front page.

    [
        {
            "by": "neonkiwi",
            "id": 8439408,
            "kids": [
                8439535,
                8439672,
                8439436,
                8439681,
                8439737,
                8439734,
                8439715,
                8439968,
                8440352,
                8440176,
                8440109,
                8439678,
                8439868,
                8439783,
                8439527,
                8439776,
                8439775,
                8439844,
                8439659,
                8440026,
                8440147
            ],
            "score": 181,
            "text": "",
            "time": 1412966894,
            "title": "What will it take to run a 2-hour marathon?",
            "type": "story",
            "url": "http://rw.runnersworld.com/sub-2/"
        },
        {
            "by": "scobar",
            "id": 8439648,
            "kids": [
                8439915,
                8440598,
                8439883,
                8440308,
                8439903,
                8440117,
                8439946,
                8439899,
                8440059,
                8439852,
                8439894,
                8439920,
                8439887,
                8439842,
                8439951,
                8439939
            ],
            "score": 79,
            "text": "",
            "time": 1412970221,
            "title": "The Toughest Adversity I've Ever Faced",
            "type": "story",
            "url": "http://scottbarbian.com/the-toughest-adversity-ive-ever-faced"
        }
    ]

The `kids` data structure will be populated on the network call for the specific details on that story.
