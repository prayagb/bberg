var request = require('request');
var cheerio = require('cheerio');

// Find a better way to build this array
alphabets = ["A","B"];
var index = 0;
var queue = [];
var firstRow = 0;


getCompanyData();
var index = 0;
getData();


function getCompanyData(alphabets[index]) {
    var url = 'http://www.bloomberg.com/Research/common/symbollookup/symbollookup.asp?letterIn=' + alphabets[index];
    request(url, function(err, resp, body) {
        if (err)
            throw err;
        $ = cheerio.load(body);
        $('.table tbody tr td a').each(function() {
          var stockPage = $(this).attr('href').replace('../../','/');
          var newURL = 'http://www.bloomberg.com/Research' + stockPage;
          queue.push(newURL);
          console.log('newURL ' + newURL);
        });
// next page
//
//
//
        index++;
        if (index < alphabets.length) {
          getCompanyData(alphabets[index]);
        };
    });
}

function getData() {
    var url = queue[index];
    if (url !== ' ') {
        request(url, function(err, resp, body) {
            if (err)
            throw err;
            $ = cheerio.load(body);
            console.log($('h1.name').text());
            console.log($('.ticker').text());
            console.log($('.exchange').text());
        });
    };
    index ++;
    if (index < queue.length) {
      getData();
    };
};
