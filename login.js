const express = require('express');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');

var router = express.Router();
var bodyParser = require('body-parser');
var flash = require('express-flash');

const app = express();

var connection = require('./database')

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static('.'));
app.use(express.static('public'));

var nome = "";

app.use(function (req, res, next) {
	res.locals.foto = req.session.foto;
	res.locals.usuario = req.session.usuario;
	// if (req.session.nome != null) {
	res.locals.nome = nome;
	// }
	next();
});

// var userRoute = require(__dirname + '/public/html/aluno/');
// app.use('/notas', userRoute);

app.set('view engine', 'ejs')

app.get('/', function(request, response) {
	// Render login template
	response.render(path.join(__dirname + '/views/index'), {errormessage: ""});
});

app.get('/solucao', function(request, response) {
	// Render login template
	response.render(path.join(__dirname + '/views/solucao'), {errormessage: ""});
});

app.post('/auth', function(request, response) {
	// Capture the input fields
	let usuario = request.body.usuario;
	let senha = request.body.senha;
	// Ensure the input fields exists and are not empty
	if (usuario && senha) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM login WHERE usuario = ? AND senha = ? limit 1', [usuario, senha], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.usuario = usuario;
				request.session.tipo_usuario = results[0].tipo_usuario;
				request.session.foto = results[0].foto;
				
				// Redirect to home page
				response.redirect('/home');
				} else {
				// response.send('Incorrect User and/or Password!');
				response.render(path.join(__dirname + '/views/index'), {errormessage: "Usuário e/ou senha incorretos!"});
			}			
			response.end();
		});
		} else {
		response.send('Please enter User and Password!');
		response.end();
	}
});

app.get('/logout', function(request, response) {
	request.session.loggedin = false;
	request.session.usuario = null;
	response.render(path.join(__dirname + '/views/index'), {errormessage: "Logout efetuado com sucesso!"});
});

app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// response.render(__dirname + '/views/escolha');
		if (request.session.tipo_usuario === "admin") {
			response.redirect('/administrador');
			} else if (request.session.tipo_usuario === "professor") {
			response.redirect('/professor');
			} else if (request.session.tipo_usuario === "aluno") {
			
			connection.query('SELECT * FROM aluno WHERE ra = ? limit 1', [request.session.usuario], function (err, result) {
				if (err) {
					request.flash('error', err);
				}
				nome = result[0].nome;
			});
			
			response.redirect('/aluno');
			// response.end();
		}
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
	// response.end();
});

var router = express.Router()

// Aluno
app.get('/aluno', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		response.render(__dirname + '/views/aluno/main', {message: ""});
		// console.log(request.session.nome);
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/aluno_editar', function(request, response) {
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
				response.render(__dirname + '/views/aluno/editar_aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				connection.query('SELECT * FROM turma', function (err, cows) {
					if (err) {
						request.flash('error', err);
						response.render(__dirname + '/views/aluno/editar_aluno', {
							// EJS variable and server-side variable
							data: "", message: "", datac: "", senha: "", urlfoto: ""
						});
						} else {
						response.render(__dirname + '/views/aluno/editar_aluno', {
							data: rows, message: "", datac: cows, senha: senha, urlfoto: urlfoto
							
						});
					}});
					
			}});
			
			} else {
			// Not logged in
			response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.post('/aluno_editado', function(request, response) {
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
		
		response.render(__dirname + '/views/aluno/main', {
			message: "Dados editados com sucesso!"
		});
		
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/notas', function(request, response) {
	
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Render login template
		
		let ra = request.session.usuario;
		
		connection.query('SELECT * FROM nota where ra_aluno = ? ORDER BY cod_disciplina', [ra], function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/aluno/notas.ejs', {
					// EJS variable and server-side variable
					data: ""
				});
				} else {
				response.render(__dirname + '/views/aluno/notas.ejs', {
					data: rows
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/faltas', function(request, response) {
	
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Render login template
		connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/aluno/faltas.ejs', {
					// EJS variable and server-side variable
					data: ""
				});
				} else {
				response.render(__dirname + '/views/aluno/faltas.ejs', {
					data: rows
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/horario', function(request, response) {
	
	if ((request.session.loggedin) && (request.session.tipo_usuario === "aluno")) {
		// Render login template
		connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/aluno/horario.ejs', {
					// EJS variable and server-side variable
					data: ""
				});
				} else {
				response.render(__dirname + '/views/aluno/horario.ejs', {
					data: rows
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

// Professor
app.get('/professor', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "professor")) {
		response.render(__dirname + '/views/professor/main');
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/frequencia', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "professor")) {
		response.render(__dirname + '/views/professor/frequencia/direction_frequencia');
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/professor_notas', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "professor")) {
		response.render(__dirname + '/views/professor/notas/direction_notas');
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

// Administrador
app.get('/administrador', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		response.render(__dirname + '/views/administrador/main');
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/administrador_aluno', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		// Render login template
		connection.query('SELECT * FROM aluno ORDER BY nome', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/administrador/aluno/aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				response.render(__dirname + '/views/administrador/aluno/aluno', {
					data: rows, message: ""
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/administrador_aluno_excluir', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		// Render login template
		var ra = request.query.ra;
		connection.query('DELETE FROM aluno WHERE ra = ?', [ra], function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/administrador/aluno/aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				
				connection.query('DELETE FROM login WHERE usuario = ?', [ra], function (err, rows) {
					if (err) {
						request.flash('error', err);
					} 
				});
				
				connection.query('SELECT * FROM aluno ORDER BY nome', function (err, rows) {
					if (err) {
						request.flash('error', err);
						response.render(__dirname + '/views/administrador/aluno/aluno', {
							// EJS variable and server-side variable
							data: "", message: ""
						});
						} else {
						response.render(__dirname + '/views/administrador/aluno/aluno', {
							data: rows, message: "Aluno excluído com sucesso!"
						});
					}
				});
			}
		});
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/administrador_aluno_cadastro', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		
		// Render login template
		connection.query('SELECT * FROM turma', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/administrador/aluno/cad_aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				response.render(__dirname + '/views/administrador/aluno/cad_aluno', {
					data: rows, message: ""
					
				});
			}});
			
			} else {
			// Not logged in
			response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.post('/administrador_aluno_cadastrado', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		// Capture the input fields
		let ra = request.body.ra;
		let nome = request.body.nome;
		let cpf = request.body.cpf;
		let email = request.body.email;
		let nasc = request.body.nasc;
		let cod_turma = request.body.cod_turma;
		
		
		connection.query('SELECT * FROM aluno WHERE ra = ? limit 1', [ra], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				response.render(__dirname + '/views/administrador/aluno/cad_aluno', {
					// EJS variable and server-side variable
					data: "", message: "Aluno não cadastrado! O RA já está cadastrado!"
				});
				} else {
				connection.query('INSERT INTO aluno (ra, nome, cpf, email, nasc, cod_turma) values (?,?,?,?,?,?)', [ra, nome, cpf, email, nasc, cod_turma], function(error, results, fields) {
					// If there is an issue with the query, output the error
					if (error) throw error;
					// response.render('administrador/adm_aluno/reg_aluno', {message: "Aluno cadastrado com sucesso!"});
				});
				
				connection.query('INSERT INTO login (usuario, senha, tipo_usuario) values (?,?,"aluno")', [ra, nasc], function(error, results, fields) {
					// If there is an issue with the query, output the error
					if (error) throw error;
					// response.render('administrador/adm_aluno/reg_aluno', {message: "Aluno cadastrado com sucesso!"});
					response.render(__dirname + '/views/administrador/aluno/cad_aluno', {
						// EJS variable and server-side variable
						data: "", message: "Aluno cadastrado com sucesso!"
					});
				});
			}			
		});
		// response.end();
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/administrador_aluno_editar', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		
		// Render login template
		var ra= request.query.ra;
		connection.query('SELECT * FROM aluno WHERE ra = ? limit 1', [ra], function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/administrador/aluno/editar_aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				connection.query('SELECT * FROM turma', function (err, cows) {
					if (err) {
						request.flash('error', err);
						response.render(__dirname + '/views/administrador/aluno/editar_aluno', {
							// EJS variable and server-side variable
							data: "", message: "", datac: ""
						});
						} else {
						response.render(__dirname + '/views/administrador/aluno/editar_aluno', {
							data: rows, message: "", datac: cows
							
						});
					}});
					
					
			}});
			
			} else {
			// Not logged in
			response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.post('/administrador_aluno_editado', function(request, response) {
	if ((request.session.loggedin) && (request.session.tipo_usuario === "admin")) {
		// Capture the input fields
		let ra = request.body.ra;
		let nome = request.body.nome;
		let cpf = request.body.cpf;
		let email = request.body.email;
		let nasc = request.body.nasc;
		let cod_turma = request.body.cod_turma;
		
		connection.query('UPDATE aluno SET nome = ?, email = ?, nasc = ?, cod_turma = ?, cpf = ? WHERE ra = ?', [nome, email, nasc, cod_turma, cpf, ra], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// response.render('administrador/adm_aluno/reg_aluno', {message: "Aluno cadastrado com sucesso!"});
		});
		
		connection.query('SELECT * FROM aluno ORDER BY nome', function (err, rows) {
			if (err) {
				request.flash('error', err);
				response.render(__dirname + '/views/administrador/aluno/aluno', {
					// EJS variable and server-side variable
					data: "", message: ""
				});
				} else {
				response.render(__dirname + '/views/administrador/aluno/aluno', {
					data: rows, message: "Aluno editado com sucesso!"
				});
			}
		});
		} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

// Extra



module.exports = router

app.listen(3000, () => {
	console.log("Servidor online.");
});