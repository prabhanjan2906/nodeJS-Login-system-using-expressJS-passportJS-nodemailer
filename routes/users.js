var express = require('express');
var router = express.Router();
var async = require('async');
var crypto = require('crypto');
var db = require("../config/db");
var nodemailer = require("nodemailer");

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/process_ForgotPassword', function(req, res, next) {
  res.render('PasswordRecovery', {title: "Password recovery"});
});


router.post('/process_ForgotPassword', function(req, res, next) {
  async.waterfall([
  function(done) {
      crypto.randomBytes(8, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token, req.body.recoverMailId);
      });
    },

function(token, userID, done) {
  callback = function(err, user)
  {
    if(err){
	next(err);
    }
    else{
	if(!user)
	{
    	  res.redirect('/users/process_ForgotPassword');
	}
	else
	  done(err, token, user);
    }
  }
  db.findUser(userID, callback);
},

function(token, user, done)
{
  // save token in DB
  db.saveToken(user, token, done);

},

function(token, user, done)
{
  if(!user)
  {
    req.flash('ErrorMessage', 'Invalid E-Mail ID. Please check the credentials and try again')
    res.redirect('/process_login');
  }
  else
  {
    var smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "user@gmail.com",
        pass: "gmailpassword"
      }
    });

    smtpTransport.sendMail({
      from: "gmail user <user@gmail.com>",
      to: user,
      subject: "Password Reset Request",
      text: "Use the below unique code to complete your password reset. \ncode = " + token,
      }, function(error, response){
           if(error){
             console.log(error);
      }else{
	res.render('PasswordRecoveryComplete', {userid : user});
      }
    });
  }
}
]);
});

router.post('/process_CompletePasswordRecovery', function(req, res, next) {
db.CheckPasswordResetCode(req.body.Tokenbox, req.param('user'), function(err, mailid){
    //req.flash('ErrorMessage', 'Successfully updated your password. Login with your new Password');
    res.render('NewPasswordReqForm', {userid : req.param('user')});
});
});

router.post('/process_NewPasswordReqForm', function(req, res, next) {
user = req.param('user');
  async.waterfall([ 

  function(done) {
	if (req.body.Tokenbox == req.body.TokenboxConfirm){
	  done(null);
	}
	else{
	  req.flash('ErrorMessage', 'Please recheck your confirmed password and try again.');
	  res.render('back');
	}
    },
   function(done){
	db.UpdatePassword(user, req.body.TokenboxConfirm, done);
   },
   function(mailid, done){
	if(mailid && done)
	{
	  //success
	  req.flash('ErrorMessage', 'Please login with your new password.');
	  res.redirect('/process_login');
	}
	else
	  req.flash('ErrorMessage', 'User name doesnot exists.');
   }

]);
});

module.exports = router;
