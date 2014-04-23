
const config = require('./config'),
      irc = require('irc'),
      https = require('https'),
      armory = require('armory').defaults({
         realm : config.wow.realm,
         region : config.wow.region
      });

// String.startsWith() taken from MDN
if (!String.prototype.startsWith) {
   Object.defineProperty(String.prototype, 'startsWith', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: function(searchString, position) {
         position = position || 0;
         return this.indexOf(searchString, position) == position;
      }
   });
}

var bot = new irc.Client(config.irc.server, config.irc.botName, {
   channels : config.irc.channels
});

var availableCommands = [
   "commands",
   "help",
   "whois"
].sort();

bot.addListener("message", function(from, to, text, message) {
   var botPrompt = config.irc.botName;
   if(text.startsWith(botPrompt)) {
      text = text.slice(text.indexOf(" ")).trim();
      var index = text.indexOf(" ");
      if(index > -1) {
         var command = text.slice(0, index);
      } else {
         var command = text;
      }
      switch(command) {
         case "commands":
            bot.say(to, from + ": the following commands are available... "
               + availableCommands.join(", "));
            break;
         case "whois":
            if(text === "whois") {
               var botResponse = from + ": please specify a player name";
               bot.say(to, botResponse);
               break;
            }
            var playerName = text.slice(text.indexOf(" "));
            var tmp = playerName.split("-");
            if(tmp.length > 1) {
               var fields = {
                  name : tmp[0],
                  realm : tmp[1]
               };
            } else {
               var fields = {
                  name : playerName
               };
            }
            armory.character(fields, function(err, res) {
               if(err) {
                  var botResponse = from + ": could not find '" + playerName + "'";
                  console.log("[ERR]: " + err);
               } else {
                  console.log(res);
                  var botResponse = from + ": " + playerName + " is a level " +
                     res.level + " " + config.wow.raceid[res.race] + " " + 
                     config.wow.classid[res.class] + "."; 
               }
               bot.say(to, botResponse);
            });
            break;
         case "auctions":
            if(text === "auctions") {
               var botResponse = from + ": please specify an item to lookup";
               bot.say(to, botResponse);
               break;
            }
            var item = text.slice(text.indexOf(" "));
            armory.auction({ realm : "Sargeras", region : "us" }, function(err, res) {
               if(err) {
                  console.log(err);
               } else {
                  console.log(res);
               }
            });
            break;
         case "help":
            if(text === "help") {
               var botResponse = from + ": what command do you need help with?";
               bot.say(to, botResponse);
               break;
            }
            var option = text.slice(text.indexOf(" ")).trim();
            switch(option) {
               case "commands":
                  var botResponse = from + ": commands - lists all available commands";
                  break;
               case "whois":
                  var botResponse = from + ": whois - looks up a character." +
                     " By default, uses the realm " + config.wow.realm + "," +
                     " although you may specify another realm. (e.g. whois " +
                     " Ganye - Archimonde)";
                  break;
               case "help":
                  var botResponse = from + ": help - displays this information.";
                  break;
            }
            bot.say(to, botResponse);
            break;
      }
   }
});
