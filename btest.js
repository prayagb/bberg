var request = require('request');
var cheerio = require('cheerio');

var url = 'http://www.bloomberg.com/Research/stocks/snapshot/snapshot.asp?ticker=ARNK:MK'
request(url, function(err, resp, body) {
    if (err)
        throw err;
    $ = cheerio.load(body);
    console.log($('h1.name').text());
    console.log($('.ticker').text());
    console.log($('.exchange').text());
});
