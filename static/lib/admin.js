'use strict';
/* globals $, app, socket */

define('admin/plugins/gb-custom', ['settings'], function(Settings) {

	var ACP = {};

	ACP.init = function() {
		Settings.load('gb-custom', $('.gb-custom-settings'));
		$('#save').on('click', function() {
			Settings.save('gb-custom', $('.gb-custom-settings'), function() {
				app.alert({
					type: 'success',
					alert_id: 'gb-custom-saved',
					title: 'Settings Saved',
					message: 'Please restart your NodeBB to apply these settings',
					clickfn: function() {
						socket.emit('admin.restart');
					}
				});
			});
		});
	};

	return ACP;
});
