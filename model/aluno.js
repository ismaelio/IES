const express = require('express');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');

var router = express.Router();
var bodyParser = require('body-parser');
var flash = require('express-flash');

var connection = require('../database');

// Aluno
router.get('/aluno', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		response.render('aluno/main', {message: ""});
		// console.log(request.session.nome);
		} else {
		response.render('index', {errormessage: "Faça login para acessar a página!"});
	}
});

router.get('/aluno_editar', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		
		// Render login template
		var ra = request.session.usuario;
		var senha = "";
		var urlfoto = "";
		
		connection.query('SELECT * FROM login WHERE usuario = ?', [ra], function (err, result) {
			if (err) {
				request.flash('error', err);
			} 
			senha = result[0].senha;
			urlfoto = result[0].foto;
		});
		
		connection.query('SELECT * FROM aluno WHERE ra = ? limit 1', [ra], function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render('aluno/editar_aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				connection.query('SELECT * FROM turma', function (err, cows) {
					if (err) {
						request.flash('error', err);
						response.render('aluno/editar_aluno', {
							// EJS variable and server-side variable
							data: "", message: "", datac: "", senha: "", urlfoto: ""
						});
						} else {
						response.render('aluno/editar_aluno', {
							data: rows, message: "", datac: cows, senha: senha, urlfoto: urlfoto
							
						});
					}});
					
			}});
			
			} else {
			// Not logged in
			response.render(path.join('index'), {errormessage: "Faça login para acessar a página!"});
	}
});

router.post('/aluno_editado', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Capture the input fields
		let ra = request.body.ra;
		let senha = request.body.senha;
		let cpf = request.body.cpf;
		let email = request.body.email;
		let urlfoto = request.body.urlfoto;
		
		connection.query('UPDATE aluno SET email = ?, cpf = ? WHERE ra = ?', [email, cpf, ra], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// response.render('administrador/adm_aluno/reg_aluno', {message: "Aluno cadastrado com sucesso!"});
		});
		
		connection.query('UPDATE login SET senha = ?, foto = ? WHERE usuario = ?', [senha, urlfoto, ra], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// response.render('administrador/adm_aluno/reg_aluno', {message: "Aluno cadastrado com sucesso!"});
		});
		
		request.session.foto = urlfoto;
		
		response.render('aluno/main', {
			message: "Dados editados com sucesso!"
		});
		
		} else {
		response.render(path.join('index'), {errormessage: "Faça login para acessar a página!"});
	}
});

router.get('/notas', function(request, response) {
	
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Render login template
		
		let ra = request.session.usuario;
		
		connection.query('SELECT * FROM nota where ra_aluno = ? ORDER BY cod_disciplina', [ra], function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render('aluno/notas.ejs', {
					// EJS variable and server-side variable
					data: ""
				});
				} else {
				response.render('aluno/notas.ejs', {
					data: rows
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join('index'), {errormessage: "Faça login para acessar a página!"});
	}
});

router.get('/faltas', function(request, response) {
	
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Render login template
		connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render('aluno/faltas.ejs', {
					// EJS variable and server-side variable
					data: ""
				});
				} else {
				response.render('aluno/faltas.ejs', {
					data: rows
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join('index'), {errormessage: "Faça login para acessar a página!"});
	}
});

router.get('/horario', function(request, response) {
	
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Render login template
		connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render('aluno/horario.ejs', {
					// EJS variable and server-side variable
					data: ""
				});
				} else {
				response.render('aluno/horario.ejs', {
					data: rows
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join('index'), {errormessage: "Faça login para acessar a página!"});
	}
});

module.exports = router;