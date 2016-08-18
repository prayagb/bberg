var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Agent = require('socks5-http-client/lib/Agent');

// Find a better way to build this array
alphabets = ["A","B","C","D"];
var index = 0;
var dataIndex = 0;
var queue = [];
var obj = {};
var firstRow = 0;
var nextPageUrl = ' ';

// Set request object
var reqObj = {
  url: 'to be set',
  agentClass: Agent,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9050 // Defaults to 1080.
  }
};

// Call the program
fs.appendFile('bloomberg.json', '[', function(err) {
if (err)
    throw err;
});
getCompanyData();



// fs.appenbdFIld('bla', JSON.stringify(obje)
function getCompanyData() {
    console.log('get company data start')
    if (firstRow == 0) {
      reqObj.url = 'http://www.bloomberg.com/Research/common/symbollookup/symbollookup.asp?letterIn=' + alphabets[index];
    } else {
      reqObj.url = 'http://www.bloomberg.com/Research/common/symbollookup/' + nextPageURL;
    };
    request(reqObj, function(err, resp, body) {
        if (err) {
            console.log('Error in Request getCompany: ' + err);
          };
        $ = cheerio.load(body);
        $('.table tbody tr td a').each(function() {
            var stockPage = $(this).attr('href').replace('../../','/');
            var newURL = 'http://www.bloomberg.com/Research' + stockPage;
            queue.push(newURL);
            // console.log('newURL ' + newURL);
        });

  // next page
        $('.nextBtnActive').each(function () {
            nextPageURL = $(this).attr('href');
        });

  // Get individual stock data
        dataIndex = 0;
        // console.log(nextPageURL);
        getData();
    });
}

function getData() {
    reqObj.url = queue[dataIndex];
    if (reqObj.url !== ' ') {
        request(reqObj, function(err, resp, body) {
            if (err) {
              console.log('Error in Request getData: ' + err + ' url: ' + reqObj.url);
            };
            $ = cheerio.load(body);
            obj.name = ($('h1.name').text()).replace(/\\n/g,'').trim();
            obj.ticker = ($('.ticker').text()).replace(/\\n/g,'').trim();
            obj.exchange = ($('.exchange').text()).replace(/\\n/g,'').trim();
            fs.appendFile('bloomberg.json', JSON.stringify(obj) + ',\n', function(err) {
              if (err) {
                throw err;
              };
            });

            dataIndex ++;
            // console.log('dataindex ' + dataIndex + ' q ' + queue.length);
            if (dataIndex < queue.length) {
                getData();
                return;
            } else {
                queue = [];
                var last8 = nextPageURL.substr(nextPageURL.length - 8);
                var textNext = last8.split("=").pop();
                var firstRowNextPage = parseInt(textNext);
                console.log('first: ' + firstRow + ' next: ' + firstRowNextPage);
            };
            if (firstRowNextPage > firstRow) {
                firstRow = firstRowNextPage;
                getCompanyData();
            } else {
                firstRow = 0;
                index++;
                if (index < alphabets.length) {
                    getCompanyData();
                } else {
                    fs.appendFile('bloomberg.json', ']', function(err) {
                    if (err)
                        throw err;
                    });
                    console.log('Bloomberg data scrapping complete!');
                    return;
                };
            };
        });
    };
};
