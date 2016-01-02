var express = require('express');
var router = express.Router();
var activator = require('activator');

function initializeActivatorInstance(config)
{
  activator.init(config)
}

config = {user: obj, emailProperty: 'emailid', transport: tObj, templates: 'psmurali@asu.edu'};

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.get('/process_ForgotPassword', function(req, res, next) {
  res.render('PasswordRecovery', { title: 'Recover Forgotten Password' });
});

router.post('/process_ForgotPassword', function(req, res, next){console.log("forgot password");}, function(req, res, next){});



module.exports = router;
