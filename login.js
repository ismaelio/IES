const express = require('express');
const session = require('express-session');
const path = require('path');
const ejs = require('ejs');

var mysql = require('mysql')
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', //
  password: 'admin', //
  database: 'nodelogin',
})
connection.connect((err) => {
  if (err) {
    console.log(err)
    return
  }
  console.log('Banco de Dados conectado.')
})
module.exports = connection

var router = express.Router();
var bodyParser = require('body-parser');
var flash = require('express-flash');

const app = express();

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));
app.use(express.static('public'));
app.use(express.static('public/html'));

// var userRoute = require(__dirname + '/public/html/aluno/');
// app.use('/notas', userRoute);

app.set('view engine', 'ejs')

// http://localhost:3000/
app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname + '/public/index.html'));
});

// http://localhost:3000/auth
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
				response.send('Incorrect User and/or Password!');
			}			
			response.end();
		});
	} else {
		response.send('Please enter User and Password!');
		response.end();
	}
});

// http://localhost:3000/home
app.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		// response.send('Welcome back, ' + request.session.usuario + '!');
		// response.redirect(__dirname + '/public/html/escolha.html');
		// const filePath = path.join(__dirname + '/public/html/escolha.html');
		// response.sendFile(filePath, function(err) {
        // if (err) {
            // return response.status(err.status).end();
        // } else {
            // return response.status(200).end();
        // }
		// }); 
		response.sendFile(__dirname + '/public/html/escolha.html');
		} else {
		// Not logged in
		response.send('Please login to view this page!');
		// response.render('view', { errormessage: 'your message' });
	}
	// response.end();
});

var router = express.Router()

app.get('/notas', function(request, response) {
	
	if (request.session.loggedin) {
	// Render login template
	connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
    // if (err) {
      // request.flash('error', err);
		// response.send(__dirname + '/public/html/aluno/notas', { data: '' });
    // } else {
		// response.send('/html/aluno/notas', { data: rows });
    // }
	
	response.render(__dirname + '/public/html/aluno/notas.ejs', {
        // EJS variable and server-side variable
        data: rows
    });
	
	});
	} else {
		// Not logged in
		response.send('Please login to view this page!');
		// response.render('view', { errormessage: 'your message' });
	}
});

module.exports = router

app.listen(3000, () => {
	console.log("Servidor online.");
});