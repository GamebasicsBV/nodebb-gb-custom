"use strict";

$(document).ready(function() {
	$(window).on('action:app.loggedOut', function(e, data) {
		if (config.sessionSharing.logoutRedirect) {
			data.next = config.sessionSharing.logoutRedirect;
		}
	});
});