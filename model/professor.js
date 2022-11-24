const express = require('express');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');

var router = express.Router();
var bodyParser = require('body-parser');
var flash = require('express-flash');

var connection = require('../database');

// Professor
router.get('/professor', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "professor")) {
		response.render('professor/main');
		} else {
		response.render('index', {errormessage: "Faça login para acessar a página!"});
	}
});

router.get('/frequencia', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "professor")) {
		response.render('professor/frequencia/direction_frequencia');
		} else {
		response.render('index', {errormessage: "Faça login para acessar a página!"});
	}
});

router.get('/professor_notas', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "professor")) {
		response.render('professor/notas/direction_notas');
		} else {
		response.render('index', {errormessage: "Faça login para acessar a página!"});
	}
});

module.exports = router;