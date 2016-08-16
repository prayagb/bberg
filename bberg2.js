var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

// Find a better way to build this array
alphabets = ["A","B"];
var index = 0;
var dataIndex = 0;
var queue = [];
var obj = {};
var firstRow = 0;
var nextPageUrl = ' ';


getCompanyData();

// fs.appenbdFIld('bla', JSON.stringify(obje)
function getCompanyData() {
    if (firstRow == 0) {
      var url = 'http://www.bloomberg.com/Research/common/symbollookup/symbollookup.asp?letterIn=' + alphabets[index];
    } else {
      var url = 'http://www.bloomberg.com/Research/common/symbollookup/' + nextPageURL;
    };
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
        $('.nextBtnActive').each(function () {
            nextPageURL = $(this).attr('href');
        });

  // Get individual stock data
        dataIndex = 0;
        getData();
    });
}

function getData() {
    var url = queue[dataIndex];
    if (url !== ' ') {
        request(url, function(err, resp, body) {
            if (err)
            throw err;
            $ = cheerio.load(body);
            obj.name = ($('h1.name').text()).replace(/\\n/g,'').trim();
            obj.ticker = ($('.ticker').text()).replace(/\\n/g,'').trim();
            obj.exchange = ($('.exchange').text()).replace(/\\n/g,'').trim();
            fs.appendFile('bloomberg.json', JSON.stringify(obj) + ',\n', function(err) {
              if (err)
                throw err;
            });
            dataIndex ++;
            if (dataIndex < queue.length) {
                getData();
            } else {
                queue = [];
                var last7 = nextPageURL.substr(nextPageURL.length - 7);
                var firstRowNextPage = last7.split("=").pop();
            };
            if (firstRowNextPage > firstRow) {
                firstRow = firstRowNextPage;
                getCompanyData();
            } else {
                firstRow = 0;
                index++;
                if (index < alphabets.length) {
                    getCompanyData();
                };
            }
        });
    };
};







      } else {
