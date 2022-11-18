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