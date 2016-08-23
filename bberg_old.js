var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');
var Agent = require('socks5-http-client/lib/Agent');

// Find a better way to build this array
alphabets = ["A","B"];
var index = 0;
var firstRow = 0;
var nextPageUrl = ' ';
var errorCount = 0;
// Set all request objects to be free
var reqFree = {
    req1: true,
    req2: true,
    req3: true
};
// Set request objects
var reqObj1 = {
  agentClass: Agent,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9050
  }
};
var reqObj2 = {
  url: 'to be set',
  agentClass: Agent,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9060
  }
};
var reqObj3 = {
  url: 'to be set',
  agentClass: Agent,
  agentOptions: {
      socksHost: 'localhost', // Defaults to 'localhost'.
      socksPort: 9070 // Defaults to 1080.
  }
};
// Call the program
fs.appendFile('bloomberg.json', '[', function(err) {
if (err)
    throw err;
});
getCompanyData();


function getCompanyData() {
    console.log('get company data start');
    var queue = [];
    // var reqObj = getFreeRequestObject();
    var reqObj = reqObj3;
    if (reqObj == undefined) {
        setTimeout(function() { getCompanyData(); }, 5000);
        return;
    };

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
        });

  // next page
        $('.nextBtnActive').each(function () {
            nextPageURL = $(this).attr('href');
        });

  //  Get individual stock data and Set Request Object to Free
        var dataIndex = 0;
        getData(queue, dataIndex);

        var last8 = nextPageURL.substr(nextPageURL.length - 8);
        var textNext = last8.split("=").pop();
        var firstRowNextPage = parseInt(textNext);
        console.log('first: ' + firstRow + ' next: ' + firstRowNextPage);
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
        console.log('company' + reqObj);
        setRequestFree(reqObj);
    });
}

function getData(queue, dataIndex) {
    var reqObj = getFreeRequestObject();
    console.log(reqFree);
    if (reqObj == undefined) {
        setTimeout(function() { getData(queue, dataIndex); }, 5000);
        return;
    };
    reqObj.url = queue[dataIndex];
    if (reqObj.url !== undefined) {
        request(reqObj, function(err, resp, body) {
            if (err) {
                errorCount ++;
                if (errorCount < 4) {
                    getData(queue, dataIndex);
                } else {
                    errorCount = 0;
                    console.log('Error in Request getData: ' + err + ' url: ' + reqObj.url);
                    console.log(body);
                    dataIndex ++
                    getData(queue, dataIndex);
                };
                return;
            };
            $ = cheerio.load(body);
            var obj = {};
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
                getData(queue, dataIndex);
                return;
            };
            setRequestFree(reqObj);
        });
    };
};

function getFreeRequestObject() {
    if (reqFree.req1) {
        reqFree.req1 = false;
        return reqObj1;
    } else if (reqFree.req2) {
        reqFree.req2 = false;
        return reqObj2;
    } else if (reqFree.req3) {
        reqFree.req3 = false;
        return reqObj3;
    } else {
        return undefined;
    };
};

function setRequestFree(reqObj) {
    if (reqObj.agentOptions.socksPort == 9050) {
        reqFree.req1 = true;
    } else if (reqObj.agentOptions.socksPort == 9060) {
        reqFree.req1 = true;
    } else {
        reqFree.req3 = true;
    };
}
