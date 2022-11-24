const express = require('express');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');

var router = express.Router();
var bodyParser = require('body-parser');
var flash = require('express-flash');

var connection = require('../database');

// Administrador
router.get('/administrador', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		response.render('administrador/main');
		} else {
		response.render('index', {errormessage: "Faça login para acessar a página!"});
	}
});

module.exports = router;