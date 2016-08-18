var fs = require('fs');
var obj = JSON.parse(fs.readFileSync('file', 'utf8'));
var marketObj = {};

obj.forEach( function (arrayItem) {

  if (arrayItem.exchange in marketObj) {
    marketObj.count += 1;
  } else {
    marketObj.exchange = arrayItem.exchange;
    marketObj.count = 1;
  };

});

fs.appendFile('exchanges.json', JSON.stringify(marketObj) + ',\n', function(err) {
  if (err) {
    throw err;
  };
});
