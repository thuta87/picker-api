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

            connection.execute("Update INTERF_IN.check_lists Set Doubt=1 , MODIFIED_DATE=current_date"+
                            " Where UNAME= :uname AND REAL_STOCK is Null"+
                            " AND trunc(CREATED_DATE)=to_char(to_date(:cdate,'YYYY-MM-DD'),'DD-Mon-YYYY')",
                {
                    uname: req.body.uname,                    
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

                    console.log("Err "+ err );
                    console.log("Results "+ results);
 
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
                


                                        
                console.log("remark : "+req.body.doubt_des);
                console.log("uname : "+req.body.uname);
                console.log("barc : "+req.body.barcode);
                console.log("date : "+req.body.cdate);
                console.log("real : "+req.body.real_stock);
                console.log("req : "+req.body.req_qty);

                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("PUT /checkAll/?uname=" + req.body.uname + "&cdate="+req.body.cdate+" : Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.put = put;