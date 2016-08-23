var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Agent = require('socks5-http-client/lib/Agent');

// Find a better way to build this array
alphabets = ["A","B"];
var index = 0;
var dataIndex = 0;
var queue = [];
var obj = {};
var firstRow = 0;
var nextPageUrl = ' ';
var errorCount = 0;
// Set all request objects to be free
// var reqFree = {
//     req1: true,
//     req2: true,
//     req3: true
// };

// Set request objects
var reqObj1 = {
  agentClass: Agent,
  timeout: 6000,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9050
  }
};
var reqObj2 = {
  agentClass: Agent,
    timeout: 6000,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9060
  }
};
var reqObj3 = {
  agentClass: Agent,
    timeout: 6000,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9070 // Defaults to 1080.
  }
};
var tors = [reqObj1, reqObj2, reqObj3];

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
      reqObj3.url = 'http://www.bloomberg.com/Research/common/symbollookup/symbollookup.asp?letterIn=' + alphabets[index];
    } else {
      reqObj3.url = 'http://www.bloomberg.com/Research/common/symbollookup/' + nextPageURL;
    };
    request(reqObj3, function(err, resp, body) {
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
        // tors.foreach(function(tor) {
        //   getData(tor);
        // });
        getData(reqObj1);
        getData(reqObj2);
        getData(reqObj3);
    });
}

function getData(reqObj) {
    dataIndex ++;
    if (dataIndex > queue.length) {
        return;
    } else if (dataIndex == queue.length) {
        queue = [];
        var last8 = nextPageURL.substr(nextPageURL.length - 8);
        var textNext = last8.split("=").pop();
        var firstRowNextPage = parseInt(textNext);
        if (firstRowNextPage > firstRow) {
              firstRow = firstRowNextPage;
              getCompanyData();
              return;
        } else {
              firstRow = 0;
              index++;
              if (index < alphabets.length) {
                  getCompanyData();
                  return;
              } else {
                  fs.appendFile('bloomberg.json', ']', function(err) {
                  if (err)
                      throw err;
                  });
                  console.log('Bloomberg data scrapping complete!');
                  return;
              };
        };
    };

    reqObj.url = queue[dataIndex - 1]; // -1 because dataIndex has already been incremented
    if (reqObj.url !== undefined) {
        request(reqObj, function(err, resp, body) {
            if (err) {
                errorCount ++;
                if (errorCount < 4) {
                    getData(reqObj);
                } else {
                    errorCount = 0;
                    console.log('Error in Request getData: ' + err + ' url: ' + reqObj.url);
                    console.log(reqObj);
                    dataIndex ++
                    getData(reqObj);
                };
                return;
            } else if (resp.statusCode != 200) {
                  console.log('Resp not 200');
                 // console.log(body);
                 // console.log(resp);
            };

            $ = cheerio.load(body);
            if ($('h1.name').text() == void 0 || $('h1.name').text() == '') {
              // problem
              return;
            }
            obj.name = ($('h1.name').text()).replace(/\\n/g,'').trim();
            obj.ticker = ($('.ticker').text()).replace(/\\n/g,'').trim();
            obj.exchange = ($('.exchange').text()).replace(/\\n/g,'').trim();
            fs.appendFile('bloomberg.json', JSON.stringify(obj) + ',\n', function(err) {
              if (err) {
                throw err;
              };
            });

            getData(reqObj);

            // } else {
            //     queue = [];
            //     var last8 = nextPageURL.substr(nextPageURL.length - 8);
            //     var textNext = last8.split("=").pop();
            //     var firstRowNextPage = parseInt(textNext);
            //     console.log('first: ' + firstRow + ' next: ' + firstRowNextPage);
            // };
            // if (firstRowNextPage > firstRow) {
            //     firstRow = firstRowNextPage;
            //     getCompanyData();
            // } else {
            //     firstRow = 0;
            //     index++;
            //     if (index < alphabets.length) {
            //         getCompanyData();
            //     } else {
            //         fs.appendFile('bloomberg.json', ']', function(err) {
            //         if (err)
            //             throw err;
            //         });
            //         console.log('Bloomberg data scrapping complete!');
            //         return;
            //     };
            // };
        });
    };
};
