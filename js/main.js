require.config({
  paths: {
    "jquery": "libs/jquery-1.7.2.min",
    "jquery-ui": "libs/jquery-ui-1.8.20.custom.min",
    "jquery-kexp": "plugins/jquery-kexp",
    "underscore": "libs/underscore",
    "backbone": "libs/backbone",
    "backbone-extensions": "plugins/backbone.extensions",
    "backbone-relational": "libs/Backbone-relational",
    "backbone-localstorage": "libs/Backbone-localstorage",
    "marionette": "libs/backbone.marionette",
    "marionette-extensions": "plugins/backbone.marionette.extensions",
    "indexeddb": "libs/backbone-indexeddb",
    "machina": "libs/machina",
    "order": "libs/order",
    "text": "libs/text",
    "linkify": "util/ba-linkify",
    "htmlencoder": "util/htmlencoder",
    "moment": "libs/moment.min",
    "ga": "https://ssl.google-analytics.com/ga",
    "gaq": "util/google-analytics",
    "lastfm-api": "services/LastFmApi",
    "md5": "util/md5",
    "toastr": "util/toastr",
    // Non AMD
    "jquery.dataTables": "libs/jquery.dataTables",
    "jquery.dataTables.sort": "plugins/jquery.dataTables.sort",
    // Non AMD
    "bootstrap": "libs/bootstrap/bootstrap"
  }
});

require(["jquery", "underscore", "KexpApp", "gaq"], function($, _, KexpApp) {

  // AudioElement is in background page so music plays when popups are not active
  var backgroundPage = chrome.extension.getBackgroundPage();
  var audioElement = backgroundPage.document.getElementById("background-audio");

  // Data attributes are used for anchor tags to seperate chrome hosting environment from app
  var backgroundTab = function(href, active, temp) {
    backgroundPage.chrome.tabs.create({url: href, active: active}, function(tab) {
      if (temp) {
        backgroundPage.setTimeout(function() {
          backgroundPage.chrome.tabs.remove(tab.id);
        }, 3000);
      }
    });
  };

  var chromeTab = function() {
    var $link = $(this),
      attrValue = $link.attr("data-chrometab"),
      active = attrValue ? (attrValue === "active") : true,
      temp = (attrValue === "temp"),
      href = $link.attr("href"),
      chromeMatches = href.match(/(chrome-extension):\/\/([\w\.?=%&=\-@\/$,]+)/);

      if (chromeMatches && chromeMatches.length == 3) {
        href = chrome.extension.getURL(chromeMatches[2]);
      }

      _gaq.push(["_trackEvent", "Link", "navigate", href]);

    if (href) {
      backgroundPage.setTimeout(backgroundTab, 0, href, temp ? false : active, temp);
    }
  };

  $(document).ready(function() {

    // Find and convert links that should be opened in new chrome tabs
    $("body").on("click", "a[data-chrometab]", chromeTab);
    $("body").on("click", ".content-external a", chromeTab);

    window.KexpApp = KexpApp;

    // Since event handlers can register with background page, we must close the app on unload
    $(window).on("unload", function() {
        _gaq.push(["_trackEvent", "App", "Close"]);
        window.KexpApp.close();
    });
    
    window.KexpApp.start({
      audioElement: audioElement
    });
  });
});