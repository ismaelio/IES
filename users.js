var express = require('express')
var connection = require('../database.js')
var router = express.Router()

router.get('/notas', function (req, res, next) {
  connection.query('SELECT * FROM notas ORDER BY disciplina', function (err, rows) {
    if (err) {
      req.flash('error', err)
      res.render('profile', { data: '' })
    } else {
      res.render('profile', { data: rows })
    }
  })
})
module.exports = router