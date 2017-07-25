"use strict";
var jwt = require('jsonwebtoken');
var meta = module.parent.require('./meta');
var winston = module.parent.require('winston');
var _ = module.parent.require('underscore');
var groups = module.parent.require('./groups');
var controllers = require('./lib/controllers');
var user = module.parent.require('./user');
var async = require('async');

var plugin = {
    settings: {
        cookieName: 'forum_token',
        secret: '',
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

        winston.info("[gb-custom] init call finished");
    },

    // Callback that will be called when a user logs on, so we can update properties likes his profile picture and keep it in sync with osm.
    userLoggedOn: function(request) {
        winston.info("[gb-custom] user logged on");
        var cookies = request.req.cookies;

         // Abort if we could not retrieve the jwt token from the cookie
        if (!Object.keys(cookies).length || !cookies.hasOwnProperty(plugin.settings.cookieName) || !cookies[plugin.settings.cookieName].length) {
            winston.info("[gb-custom] No information in the JWT cookie");
            return;
        }

        // Retrieve the user info from the jwt cookie using the secret from the plugin settings.
        var tokenFromCookie = cookies[plugin.settings.cookieName];
        var token = jwt.verify(tokenFromCookie, plugin.settings.secret);

        // Check if the token can be verified.
        if(!token) {
            winston.info("[gb-custom] Token could not be verified");
            return;
        }
        // Strip the "_NL" from the NL userId.
        var website = token.username.endsWith("_NL")
                        // Strip the last part of an NL username (_NL)
                        ? "https://www.onlinesoccermanager.nl/Users/" + token.id.slice(0, -3) + "/Profile"
                        : "https://www.onlinesoccermanager.com/Users/" + token.id + "/Profile";

        var query = {};

        // Check if we need to update the website.
        if (website) {
            winston.info('[session-sharing] Updating website for user with id ' + request.uid + ' to ' + website);
            query.updateWebsite = async.apply(user.setUserFields, request.uid, {
                website: website
            });
        }

        // Update the avatar of the user on login
        if (token.picture) {
            winston.info('[session-sharing] Updating picture for user with id ' + request.uid + ' to ' + token.picture);

            query.updatePicture = async.apply(user.setUserFields, request.uid, {
                picture: token.picture
            });
        }

         // Decide if the user can join his own language group category on the forum.
        var languageGroupName = plugin.settings.languageCodePrefix + token.languagecode.toUpperCase();
        winston.info("[gb-custom] Checking if we can join an existing language group");
        // We don't want to create language groups, so check if it exists first.

        groups.exists(languageGroupName, function (err, result) {
            if (!err && result) {
                winston.info("[gb-custom] Joining language group : " + languageGroupName + " for user id: " + request.uid);
                // Join the language group for this user.
                groups.join(languageGroupName, request.uid, function (err) {});
            }
        });

        async.parallel(query, function (err, done) {
 			if (err) {
 				 winston.error("[gb-custom] Error while updating user info from OSM");
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