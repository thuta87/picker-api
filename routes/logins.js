var oracledb = require('oracledb');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');
 
function post(req, res, next) {
    oracledb.getConnection(
        config.database,
        function(err, connection){
            if (err) {
                return next(err);
            }

            //'   utl_raw.cast_to_varchar2(utl_encode.base64_decode(utl_raw.cast_to_raw(AUSPASS))) as "password" '     
            connection.execute(
                  ' SELECT AUSEXTUSER as "user",'+
                  '                 AUSEXTUSER as "username",'+
                  '                 AUSDESC as "full_name",'+
                  '                 ausprof as "profile",'+
                  '                 utl_raw.cast_to_varchar2(utl_encode.base64_decode(utl_raw.cast_to_raw(AUSPASS))) as "password",'+
                  '                 ausappli as "module"'+
                  '                 FROM ADM_Users'+
                  ' where AUSEXTUSER like :username'+                 
                  ' Union All'+                 
                  ' SELECT user_id as "user",username,full_name,"PROFILE","PASSWORD","MOD" as "module" FROM INTERF_IN.PCK_USERS'+
                  ' where user_id like :username2', 

		/*
                  ' With Tmp as (SELECT AUSEXTUSER as "user",'+
                  '                 AUSEXTUSER as "username",'+
                  '                 AUSDESC as "full_name",'+
                  '                 ausprof as "profile",'+
                  '                 utl_raw.cast_to_varchar2(utl_encode.base64_decode(utl_raw.cast_to_raw(AUSPASS))) as "password",'+
                  '                 ausappli as "module"'+
                  '                 FROM ADM_Users'+
                  ' Union All                 '+
                  ' SELECT user_id as "user",username,full_name,"PROFILE","PASSWORD","MOD" as "module" FROM INTERF_IN.PCK_USERS)'+
		  ' SELECT * FROM Tmp'+
                  ' where user like :username ',
		
                'SELECT AUSEXTUSER as "user",'+
                ' AUSEXTUSER as "username",'+
                ' AUSDESC as "full_name",'+
                ' ausprof as "profile",'+
                ' ausappli as "module",'+
                ' utl_raw.cast_to_varchar2(utl_encode.base64_decode(utl_raw.cast_to_raw(AUSPASS))) as "password"'+
                ' FROM ADM_Users'+
                ' where AUSEXTUSER like :username',
		*/
                /*
                'SELECT AUSEXTUSER as "user",'+
                ' AUSUSER as "username", ' +
                '   AUSDESC as "full_name", ' +
                '   utl_raw.cast_to_varchar2(utl_encode.base64_decode(utl_raw.cast_to_raw(AUSPASS))) as "password" ' +
                ' FROM ADM_Users ' +
                ' where AUSUSER like :username '+
		' and ASIAPPLI like :lmod',
                */
                {
                    username: req.body.username,
		    username2: req.body.username,
                },
                {
                    outFormat: oracledb.OBJECT
                },
                function(err, results){
                    var user;
 
                    if (err) {
                        connection.release(function(err) {
                            if (err) {
                                console.error(err.message);
                            }
                        });
 
                        return next(err);
                    }
 
                    user = results.rows[0];
                    console.log(user);
 
                    bcrypt.compare(req.body.password, user.password, function(err, pwMatch) {
                        var payload;
 
                        if (err) {
                            return next(err);
                        }
                        console.log(req.body.password);
                        console.log(user.password);
                        var pwM = bcrypt.compareSync(req.body.password, user.password);
                        console.log(pwM);
			console.log('Input args /username='+req.body.username+'&username2='+req.body.username);		
	
                        /*
                        if (!pwMatch) {
                            res.status(401).send({message: 'Invalid username or password.'});
                            return;
                        }
                        */
                        
                        if (req.body.password != user.password){
                            res.status(401).send({message: 'Invalid username or password.'});
                            return;
                        }
                        
                        payload = {
                            sub: user.username,
                            full_name: user.full_name                          
                        };
                        
                        res.status(200).json({
                            user: user,
                            token: jwt.sign(payload, config.jwtSecretKey, {expiresIn:86400})
                        });                        
                    });
 
                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }
                    });
                });
        }
    );
}
 
module.exports.post = post;
