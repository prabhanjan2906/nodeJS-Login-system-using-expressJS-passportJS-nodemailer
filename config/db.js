var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');

error_codes = {errorCode_Success : 0, errorCode_UserExists : 1, errorCode_DBConnectionFailure : 2, errorCode_UserDoesnotExists : 3, errorCode_PasswordMismatch : 4};

var connection = null;
var DbUsername = process.env.DATABASE_USER || 'root';
var dbPassword = process.env.DATABASE_PASSWD || 'DATABASE_PASSWD';
var dbHost = process.env.DATABASE_HOSTNAME || 'localhost';
var dbName = process.env.LOGIN_DATABASE || 'LOGIN_DATABASE';
var tableName = process.env.LOGIN_TABLE || 'LOGIN_TABLE';
var query = null;
var error = null;

function connectToDB()
{
  if (connection != null)
    return error_codes.errorCode_Success;

  connection = mysql.createConnection({
	  host     : dbHost,
	  user     : DbUsername,
	  password : dbPassword,
	  database : dbName
  });
  connection.connect(function(err) {
    if (err) {
      console.error('error connecting: ' + err.stack);
      error = err;
      return error_codes.errorCode_DBConnectionFailure;
    }
  });
  return error_codes.errorCode_Success;
}

function SearchDatabase(mailid, done)
{
  query = "SELECT * FROM " + tableName + " WHERE mailid=\"" + mailid + "\";";

  //in case if there is no connection object.
  if (connection == null)
  {
    console.log("Re-Connecting to DB");
    if(connectToDB() != error_codes.errorCode_Success)
	return error_codes.errorCode_DBConnectionFailure;
  }

  connection.query(query, function(err, rows) {
  if(err)
  {
    error = err;
    return done(err);
  }
  else if(rows.length == 1)
  {
    return done(null, mailid);
  }
  else{
    return done(null, false, req.flash('ErrorMessage', 'user do not exists'));
  }
  });
}

module.exports = {
return_code: error_codes,

e: error, 

findUser: function(emailid, callback)
{
  return SearchDatabase(emailid, callback);
},

ConnectToDataBase: connectToDB,

RegisterUser: function(req, mailid, passwd, done)
{
connection = null;
//in case if there is no connection object.
if (connection == null)
{
  if (connectToDB() != error_codes.errorCode_Success)
	return error_codes.errorCode_DBConnectionFailure;
}

query = "SELECT passwd from " + tableName + " WHERE mailid=\"" + mailid + "\";";
  connection.query(query, function(err, rows) {
  if(err)
  {
    return done(err);
  }
  else if(rows.length > 0)
  {
    return done(null, false);
  }
  else
  {
    query = "INSERT INTO " + tableName + " VALUES(\"" + mailid + "\", \"" + bcrypt.hashSync(passwd, null, null) + "\", \"" + req.body.secQues + "\", \"" + req.body.securityAnswer + "\", 0);";
  connection.query(query, function(err, rows) {
    if(err)
    {
      return done(err);
    }
    return done(null, mailid);
  });
  }
  });
},

Login : function(req, userid, password, done) {
  query = "SELECT passwd FROM " + tableName + " WHERE mailid=\"" + userid + "\";";
  //in case if there is no connection object.
  if (connection == null)
  {
    if(connectToDB() != error_codes.errorCode_Success)
	return done(error);
  }

  connection.query(query, function(err, rows) {
  if(err)
  {
    error = err;
    return done(err);
  }
  else if(rows.length === 1)
  {
    if (bcrypt.compareSync(password, rows[0].passwd))
    {
	return done(null, userid);
    }
    else{
	return done(null, false, req.flash('ErrorMessage', 'Invalid Credentials. Please try again'));
    }
  }
  else
    {
	return done(null, false, req.flash('ErrorMessage', 'User not present'));
    }  
  });
}

};
