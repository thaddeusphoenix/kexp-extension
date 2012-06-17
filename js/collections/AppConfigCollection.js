define([
  "jquery",
  "underscore",
  "backbone-kexp",
  "backbone-localstorage",
  "models/LastFmConfigModel",
  "models/AppFeaturesConfigModel"
  ], function($, _, Backbone, Store, LastFmConfigModel, AppFeaturesConfigModel) {

  var AppConfigCollection = Backbone.Collection.extend({

    initialize: function(models, options) {
      
      options || (options = {});

      if (options.localStorage && _.isFunction(options.localStorage.sync)) {
        this.localStorage = options.localStorage;
        this.sync = options.localStorage.sync;
      } else {
        this.localStorage = new Store("app.kexp.config");
        this.sync = this.localStorage.sync;
      }
    },
    parse: function(resp, xhr) {
      var models = [];

      if (!_.isArray(resp)) {
        resp = [resp];
      }

      _.each(resp, function(item) {
        if (item.id === "lastfm") {
          models.push(new LastFmConfigModel(item));
        }
        else if (item.id === "features") {
          models.push(new AppFeaturesConfigModel(item));
        }
        else {
          console.error("Unknown config item: " + item.id, item);
          throw new Error("Unknown config item: " + item.id);
        }
      });
      return models;
    },
    getDefaults: function() {
      this.fetch();
      this.getLastFm();
      this.getFeatures();
    },
    getLastFm: function() {
      return this.get("lastfm") || this.create(new LastFmConfigModel());
    },
    getFeatures: function() {
      return this.get("features") || this.create(new AppFeaturesConfigModel());
    }
  });
  return AppConfigCollection;
});