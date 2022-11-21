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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static('.'));
app.use(express.static('public'));

// var userRoute = require(__dirname + '/public/html/aluno/');
// app.use('/notas', userRoute);

app.set('view engine', 'ejs')

app.get('/', function(request, response) {
	// Render login template
	response.render(path.join(__dirname + '/views/index'), {errormessage: ""});
});

app.post('/auth', function(request, response) {
	// Capture the input fields
	let usuario = request.body.usuario;
	let senha = request.body.senha;
	// Ensure the input fields exists and are not empty
	if (usuario && senha) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE usuario = ? AND senha = ?', [usuario, senha], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.usuario = usuario;
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
		response.render(__dirname + '/views/escolha');
		} else {
		// Not logged in
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
	// response.end();
});

var router = express.Router()

app.get('/notas', function(request, response) {
	
	if (request.session.loggedin) {
	// Render login template
	connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
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

app.get('/aluno', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/views/aluno/main');
	} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

// Professor
app.get('/professor', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/views/professor/main');
	} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/frequencia', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/views/professor/frequencia/direction_frequencia');
	} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/professor_notas', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/views/professor/notas/direction_notas');
	} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

// Administrador
app.get('/administrador', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/views/administrador/main');
	} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.get('/administrador_aluno', function(request, response) {
	if (request.session.loggedin) {
		response.render(__dirname + '/views/administrador/adm_aluno/reg_aluno', {message: ""});
	} else {
		response.render(path.join(__dirname + '/views/index'), {errormessage: "Faça login para acessar a página!"});
	}
});

app.post('/administrador_aluno_cadastrado', function(request, response) {
	// Capture the input fields
	let ra = request.body.ra;
	let nome = request.body.nome;
	let cpf = request.body.cpf;
	let email = request.body.email;
	let nasc = request.body.nasc;
	
		connection.query('INSERT INTO aluno (ra, nome, cpf, email, nasc) values ("?","?","?","?","?")', [ra, nome, cpf, email, nasc], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
				response.render('administrador/adm_aluno/reg_aluno', {message: "Aluno cadastrado com sucesso!"});
		});
		// response.end();
});

module.exports = router

app.listen(3000, () => {
	console.log("Servidor online.");
});