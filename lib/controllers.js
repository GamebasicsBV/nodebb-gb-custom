'use strict';

var Controllers = {};

Controllers.renderAdminPage = function (req, res) {
	res.render('admin/plugins/gb-custom', {});
};

module.exports = Controllers;