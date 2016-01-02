var db = require('./db');

var ret = db.ConnectToDataBase();

module.exports = function(passport, LocalStrategy)
{

passport.serializeUser(function(user, done) {
        done(null, user);
    });

passport.deserializeUser( db.findUser);

    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
	    passReqToCallback : true
        },
        db.RegisterUser)
    );

passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
	    passReqToCallback : true
        },  db.Login
));

}
