const request = require('request'),
      config = require('./config');

var auctionbot = {};

auctionbot._get = function(url, callback) {
   request({
      url: url,
      json: true
   }, callback);
};

auctionbot.findCharacter = function(options, callback) {
   var region = options.region || config.wow.region,
       realm = options.realm || config.wow.realm,
       name = options.name || config.wow.name,
       url = 'http://' + region + '.battle.net/api/wow/character/' +
          realm + '/' + name;

   return this._get(url, callback);
};

auctionbot.findAuctions = function(options, callback) {
   var region = options.region || config.wow.region,
       realm = options.realm || config.wow.realm,
       url = 'http://' + region + '.battle.net/api/wow/auction/data' +
          realm;

   return this._get(url, function(error, response, body) {
      if(!error && response.statusCode === 200) {
         var aucurl = body.files[0].url;
         return this._get(aucurl, callback);
      } else {
         var err = error || new Error(body.reason);
         throw err;
      }
   });
};

module.exports = auctionbot;
