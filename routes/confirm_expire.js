var oracledb = require('oracledb');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');
 
function put(req, res, next) {
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

            connection.execute("Update INTERF_IN.EXPIRE_LIST Set Doubt=1 , MODIFIED_DATE=current_date"+
                            " Where SUBSTR(uname,1,length(uname)-1) = SUBSTR(:uname,1,length(:uname)-1) AND NVL(Doubt,0)=0 AND Barcode=:barcode " + 
			    " AND trunc(EXPIRE_DATE)=to_char(to_date(:cdate,'YYYY-MM-DD'),'DD-Mon-YYYY')",
                {
                    uname: req.body.uname,                    
		    barcode: req.body.barcode,
		    cdate: req.body.cdate,
                },
                {
                    autoCommit: true
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


                if (results.rowsAffected!==0){

                    var msg = {
                        message: 'Successful'
                        };
                        
                    var rtn_results= results.rows || msg; 

                        console.log(rtn_results);
                        res.status(200).json(rtn_results.message);

                }   //res.status(200).json(results.rows);
                

                console.log("user : "+req.body.uname);
                console.log("bcode : "+req.body.barcode);

                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("PUT /confirm_expire/?uname=" + req.body.uname + "&cdate="+req.body.cdate+"&barcode="+req.body.barcode+" : Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.put = put;
