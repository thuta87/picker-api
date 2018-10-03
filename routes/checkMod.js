var oracledb = require('oracledb');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');
 
function get(req, res, next) {
    var token;
    var payload;
 
    if (!req.headers.authorization) {
        return res.status(401).send({message: 'You are not authorized'});
    }
 
    token = req.headers.authorization.split(' ')[1];
 
    try {
        payload = jwt.verify(token, config.jwtSecretKey);
    } catch (e) {
        if (e.name === 'TokenExpiredError') {
            res.status(401).send({message: 'Token Expired'});
        } else {
            res.status(401).send({message: 'Authentication failed'});
        }
 
        return;
    }
 
    oracledb.getConnection(
        config.database,
        function(err, connection){
            if (err) {
                return next(err);
            }
 
             connection.execute("SELECT * FROM INTERF_IN.USR_PERMISSION Where MOD like 'Expire' and Gold_usr like :uname ",
                {
                    uname: req.query.uname
                },
                {
                    outFormat: oracledb.OBJECT
                },
                function(err, results){
                    if (err) {
                        connection.release(function(err) {
                            if (err) {
                                console.error(err.message);
                            }
                        });
 
                        return next(err);
                    }
                    console.log(results);

                    res.status(200).json(results.rows);
 
                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("GET /check_MOD/?uname=" + req.query.uname + ": Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.get = get;