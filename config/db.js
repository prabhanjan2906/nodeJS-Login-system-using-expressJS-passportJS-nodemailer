var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var async = require('async');

error_codes = {errorCode_Success : 0, errorCode_UserExists : 1, errorCode_DBConnectionFailure : 2, errorCode_UserDoesnotExists : 3, errorCode_PasswordMismatch : 4};

var connection = null;
var DbUsername = process.env.DATABASE_USER || 'root';
var dbPassword = process.env.DATABASE_PASSWD || 'rootpassword';
var dbHost = process.env.DATABASE_HOSTNAME || 'localhost';
var dbName = process.env.LOGIN_DATABASE || 'LoginDB';
var tableName = process.env.LOGIN_TABLE || 'login_details';
var loginHistory_tableName = process.env.LOGINHISTORY_TABLE || 'login_history';
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
    //("Re-Connecting to DB");
    if(connectToDB() != error_codes.errorCode_Success)
	return error_codes.errorCode_DBConnectionFailure;
  }

  connection.query(query, function(err, rows) {
  if(err)
  {
    return done(err);
  }
  else if(rows.length == 1)
  {
    return done(null, mailid);
  }
  else{
    return done(null, false);
  }
  });
}

function updateLoginTime(userID, done)
{
  async.waterfall([
    function(callback)
    {
	query = "insert into " + loginHistory_tableName + " values(\"" + userID + "\", NOW());";
	console.log(query);

        //in case if there is no connection object.
    	if (connection == null)
	{
	      if (connectToDB() != error_codes.errorCode_Success)
		return error_codes.errorCode_DBConnectionFailure;
    	}
	connection.query(query, function(err, rows) {
	  if(err)
		return done(null, userID); // return success. The user is logged in
  	  return done(null, userID);
	});

    }
   ]);
}

/*function updateLoginTime(userID, done)
{
  query = "update " + tableName + " set loginTime=NOW() where mailid =\"" + userID +"\";";
  //in case if there is no connection object.
  if (connection == null)
  {
    if (connectToDB() != error_codes.errorCode_Success)
	return error_codes.errorCode_DBConnectionFailure;
  }
  connection.query(query, function(err, rows) {
    return done(null, userID); // return success. The user is logged in
  });
  
}*/

module.exports = {
return_code: error_codes,

findUser: function(emailid, callback)
{
  return SearchDatabase(emailid, callback);
},

ConnectToDataBase: connectToDB,

RegisterUser: function(req, mailid, passwd, done)
{
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
    query = "INSERT INTO " + tableName + " VALUES(\"" + mailid + "\", \"" + bcrypt.hashSync(passwd, null, null) + "\", \"" + req.body.FirstName + "\", NULL);";
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
    return done(err);
  }
  else if(rows.length === 1)
  {
    if (bcrypt.compareSync(password, rows[0].passwd))
    {
	updateLoginTime(userid, done);
	//return done(null, userid);
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
},

saveToken(user, token, done)
{
  query = "update " + tableName +" set PasswordResetCode=\"" + token + "\" where mailid='" + user + "';";
  //in case if there is no connection object.
  if (connection == null)
  {
    if(connectToDB() != error_codes.errorCode_Success)
	return done(error);
  }

  connection.query(query, function(err, rows) {
  if(err)
  {
    return done(err);
  }
  else if(rows.affectedRows > 0)
  {
    done(null, token, user);
  }

  });
},

CheckPasswordResetCode(token, mailid, done)
{
  query = "SELECT PasswordResetCode FROM " + tableName + " WHERE mailid=\"" + mailid + "\";";
  //in case if there is no connection object.
  if (connection == null)
  {
    //("Re-Connecting to DB");
    if(connectToDB() != error_codes.errorCode_Success)
	return error_codes.errorCode_DBConnectionFailure;
  }

  connection.query(query, function(err, rows) {
  if(err)
  {
    return done(err);
  }
  else if(rows.length == 1)
  {
    if(rows[0].PasswordResetCode == token)
    {
	return done(null, mailid);	
    }
    else
        return done(null, false);

  }
  else{
    return done(null, false);
  }
  });
},

UpdatePassword(mailid, newPasswd, done){
  query = "update " + tableName +" set PasswordResetCode=NULL, passwd =\"" + bcrypt.hashSync(newPasswd, null, null) + "\" where mailid='" + mailid + "';";
  //in case if there is no connection object.
  if (connection == null)
  {
    //("Re-Connecting to DB");
    if(connectToDB() != error_codes.errorCode_Success)
	return error_codes.errorCode_DBConnectionFailure;
  }

  connection.query(query, function(err, rows) {

  if(err)
  {
    return done(err);
  }
  else if(rows.affectedRows == 1)
  {
    return done(null, mailid);
  }
  else
    return done(null, false);

  });
}
};
