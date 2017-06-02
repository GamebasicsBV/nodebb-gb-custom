"use strict";
var jwt = require('jsonwebtoken');
var meta = module.parent.require('./meta');
var winston = module.parent.require('winston');
var _ = module.parent.require('underscore');
var groups = module.parent.require('./groups');
var controllers = require('./lib/controllers');

var plugin = {
    settings: {
        cookieName: 'forum_token',
        secret: '',
        payload: {
            username: "",
            id: "",
            picture: "",
            languagecode: "",
            crewname: "",
            crewid: ""
        },
        isInitialized: false,
        ready: false,
        languageCodePrefix: ""
    },

    // Callback that will be called when a user enters the forum.
    // static:app.load
    init: function(params, callback) {
        var router = params.router;
        router.get('/api/admin/plugins/gb-custom', controllers.renderAdminPage);
        // Load the settings from the database.
        plugin.reloadSettings(callback);

        winston.info("[gb-custom] plugin initialized");
    },

    // Callback that will be called when a user gets created, so we can make him join a category that corresponds to his languagecode.
    // action:user.create
    userCreated: function(userObject) {
        // Decide if the user can join his own language group category on the forum.
        var languageGroupName = plugin.settings.languageCodePrefix + plugin.settings.payload.languagecode.toUpperCase();
        winston.info("[gb-custom] User created, checking if we can join an existing language group");
        // We don't want to create language groups, so check if it exists first.

        groups.exists(languageGroupName, function (err, result) {
            if (!err && result) {
                winston.info("[gb-custom] Joining language group : " + languageGroupName + " for user id: " + userObject.user.uid);
                // Join the language group for this user.
                groups.join(languageGroupName, userObject.user.uid, function (err) {});
            }
        });
    },

    // Retrieve settings, called inside the init function when the website loads for a user.
    reloadSettings: function(callback) {
        meta.settings.get('gb-custom', function(err, settings) {
            if (err) {
                return callback(err);
            }

            winston.info('[gb-custom] Settings OK');
            
            plugin.settings = _.defaults(_.pick(settings, Boolean), plugin.settings);
            plugin.ready = true;

            callback();
        });
    },

    // When a user gets created, this filter will be called. In it we will modify and add some of the properties that were located inside our jwt cookie.
    // filter:user.create
    setExtraUserInfoFromJwtOnUserCreate: function(postData, callback) {
        
        if(!plugin.settings.isInitialized) {
            winston.info("[gb-custom] info from jwt token not set, can't continue");
            return;
        }

        winston.info("[gb-custom] Setting extra user info from json web token");

        // Strip the "_NL" from the NL userId.
        var website = postData.user.username.endsWith("_NL")
                        // Strip the last part of an NL username (_NL)
                        ? "https://www.onlinesoccermanager.nl/Users/" + plugin.settings.payload.id.slice(0, -3) + "/Profile"
                        : "https://www.onlinesoccermanager.com/Users/" + plugin.settings.payload.id + "/Profile";

        // Set the website property on the forum to his osm profile.
        postData.user.website = website;

        // Set his forum avatar to his picture on osm.
        postData.user.picture = plugin.settings.payload.picture;
    
        callback(null, postData);
    },

    /* add a middleware function to every request done to the webserver.
    * Use it to read the jwt cookie once, and retrieve all info from it for later use. filter:router.page*/
    addMiddleware: function(req, res, next) {
        // Dont continue if we already retrieved the info from the jwt cookie.
        if (plugin.settings.isInitialized) {
            winston.info("[gb-custom] Plugin not yet initialized.");
            next();
            return;
        }
        
        // Abort if we could not retrieve the jwt token from the cookie
        if (!Object.keys(req.cookies).length || !req.cookies.hasOwnProperty(plugin.settings.cookieName) || !req.cookies[plugin.settings.cookieName].length) {
            next();
            winston.info("[gb-custom] No information in the JWT cookie");
            return;
        }

        var tokenFromCookie = req.cookies[plugin.settings.cookieName];
        var token = jwt.verify(tokenFromCookie, plugin.settings.secret);

        // Check if the token can be verified.
        if(!token) {
            next();
            return;
        }
        winston.info("[gb-custom] Saving the payload from the jwt token to the plugin settings for later use.");

        // Dont continue if any of the necessary properties are not set.
        if(!token.username || !token.id || !token.languagecode)
            return;
        // Save the info comming from the token into the settings, so we can use it later.
        plugin.settings.payload =  {
            username: token.username,
            id: token.id,
            picture: token.picture,
            languagecode: token.languagecode,
            crewname: token.crewname,
            crewid: token.crewid
        };
        winston.info("[gb-custom] jwt cookie info succesfully initialized");
        plugin.settings.isInitialized = true;
        
        next();
    },
    // Adds the navigation to plugins dropdown on the admin panel. (filter:admin.header.build)
    addAdminNavigation: function(header, callback) {
        header.plugins.push({
            route: '/plugins/gb-custom',
            icon: 'fa-user-secret',
            name: 'Gamebasics custom'
        });

        callback(null, header);
    },
};

module.exports = plugin;