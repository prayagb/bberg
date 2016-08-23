var fs = require('fs');

function fileExists (ex) {
    try {
        return fs.statSync(ex);
    } catch (e) {
        if(e.code === 'ENOENT') {
          return false
        }
    }
};

if (fileExists('exchanges.json')) {
    var marketObj = JSON.parse(fs.readFileSync('exchanges.json', 'utf8'));
  } else {
    var marketObj = {};
};

var obj = JSON.parse(fs.readFileSync('./test_data.json', 'utf8'));

obj.forEach( function (arrayItem) {
    var exchange = arrayItem.exchange
        if (arrayItem.exchange in marketObj) {
            marketObj[exchange] += 1;

        } else {
            marketObj[exchange] = 1;
        };
});

console.log(marketObj);

fs.writeFile('exchanges.json', JSON.stringify(marketObj).replace(/([0-9],)/g, '$1\n'), function(err) {
  if (err) {
    throw err;
  };
});
