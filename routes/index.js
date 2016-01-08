var mailClient = require('nodemailer');
var express = require('express');
var router = express.Router();
var request = require('request');
var https = require('https');

function checkAuth(req, res, next)
{
    if(req.isAuthenticated())
    {
	req.logout();
    	res.redirect('/process_login');
    }
}

function successRedirect(userID)
{
    var options = { 
    rejectUnauthorized: false,
    hostname: 'swent0linux.asu.edu',
    path: '/ca_dashboard',
    method: 'GET',
    qs: {q: userID}
    };
    var results = ''; 


    var req = https.request(options, function(res) {
    res.on('data', function (chunk) {
        results = results + chunk;
        console.log("results = ");
	console.log(results);
    }); 
    res.on('end', function () {
	console.log('in end function');
    }); 
});

req.on('error', function(e) {
	console.log('in error function');
	console.log(e);
});

req.end();
}


exports.init = function(passport)
{

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dashboard', heading: "Dashboard" });
});

router.get('/process_login', function(req, res, next) {
  var message = req.flash('ErrorMessage');
  if(req.isAuthenticated())
  {
    res.writeHead(301,  {Location: 'https://swent0linux.asu.edu/ca_dashboard/?q=' + req.user});
    res.end();
    //res.render('success');
  }
  else
  {
  res.render('login', { title: 'Dashboard Login' , errorMessage: message});
  }
});

router.post('/process_login', passport.authenticate('local-login', {successRedirect : '/success', failureRedirect : '/process_login', failureFlash : true}));

router.get('/process_signup', function(req, res, next) {
  if(req.isAuthenticated())
  {
    //res.render('success');
    res.writeHead(301,  {Location: 'https://swent0linux.asu.edu/ca_dashboard/?q=' + req.user});
    res.end();
  }
  else
    res.render('signup', { title: 'Dashboard New User Registration' });
});

router.post('/process_newUser', passport.authenticate('local-signup', {
successRedirect : '/process_login', failureRedirect : '/process_signup', failureFlash : true})
);

router.post('/success', function(req, res, next)
{
  if(req.isAuthenticated())
  {
    //res.render('success');
    res.writeHead(301,  {Location: 'https://swent0linux.asu.edu/ca_dashboard/?q=' + req.user});
    res.end();
  }
  else
  {
    res.redirect('/process_login');
  }
}
);

router.get('/success', function(req, res, next)
{
  console.log(req.user);

  if(req.isAuthenticated())
  {
    res.writeHead(301,  {Location: 'https://swent0linux.asu.edu/ca_dashboard/?q=' + req.user});
    res.end();
  }
  else
  {
    console.log("not success");
    res.redirect('/process_login');
  }
}
);

router.get('/process_logout', checkAuth, function(req, res, next) {
//  res.render('login', { title: 'Dashboard Login' });
});

return router;
};
