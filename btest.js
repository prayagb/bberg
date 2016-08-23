var request = require('request');
var cheerio = require('cheerio');
fs = require('fs');
var Agent = require('socks5-https-client/lib/Agent');


var reqObj = {
  url: 'to be set',
  agentClass: Agent,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9050 // Defaults to 1080.
  }
};

//var url = 'http://www.bloomberg.com/Research/common/symbollookup/symbollookup.asp?letterIn=A'
//reqObj.url = 'http://www.bloomberg.com/Research/stocks/snapshot/snapshot.asp?ticker=ARNK:MK'
reqObj.url = 'https://api.ipify.org?format=json';

request(reqObj, function(err, resp, body) {
    if (err)
        throw err;
    $ = cheerio.load(body);
    var nextPageURL = 'aa ';
    console.log(body);
    console.log($('h1.name').text());
    console.log($('.ticker').text());
    console.log($('.exchange').text());
    var company = $('h1.name').text().replace(/\\n/g, '').trim();
    var ticker = $('.ticker').text().replace(/\\n/g, '').trim();
    var exchange = $('.exchange').text().replace(/\\n/g, '').trim();
    obj = {};
    obj.company = company;
    obj.ticker = ticker;
    obj.exchange = exchange;
    var json = JSON.stringify(obj);
    fs.writeFile('testfile.json', json, 'utf8', function () {});
    // var nextPageUrl = $('.nextBtnActive').attr('href');
    $('.nextBtnActive').each(function () {
     nextPageURL = $(this).attr('href');

    });
      console.log(nextPageURL);
      console.log('jdjdjddj');
      var last7 = nextPageURL.substr(nextPageURL.length - 7)
      var firstRow = last7.split("=").pop();
      console.log(firstRow);
});

