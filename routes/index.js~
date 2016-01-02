var mailClient = require('nodemailer');
var express = require('express');
var router = express.Router();

function checkAuth(req, res, next)
{
    if(req.isAuthenticated())
    {
	req.logout();
    	res.redirect('/process_login');
    }
}

exports.init = function(passport)
{

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Dashboard - Arizona State University', heading: "Dashboard" });
});

router.get('/process_login', function(req, res, next) {
  var message = req.flash('ErrorMessage');
  if(req.isAuthenticated())
  {
    res.render('success');
  }
  else
  {
  res.render('login', { title: 'Dashboard Login' , errorMessage: message});
  }
});

router.post('/process_login', passport.authenticate('local-login', {successRedirect : '/success', failureRedirect : '/process_login', failureFlash : true}
)
);

router.get('/process_signup', function(req, res, next) {
  if(req.isAuthenticated())
  {
    res.render('success');
  }
  else
    res.render('signup', { title: 'Dashboard New User Registration' });
});

router.post('/process_newUser', passport.authenticate('local-signup', {
successRedirect : '/success', failureRedirect : '/process_signup', failureFlash : true})
);

router.post('/success', function(req, res, next)
{
  if(req.isAuthenticated())
  {
    res.render('success');
  }
  else
  {
    res.redirect('/process_login');
  }
}
);

router.get('/success', function(req, res, next)
{
  if(req.isAuthenticated())
  {

    res.render('success');
  }
  else
  {
    res.redirect('/process_login');
  }
}
);

router.get('/process_logout', checkAuth, function(req, res, next) {
//  res.render('login', { title: 'Dashboard Login' });
});

return router;
};
