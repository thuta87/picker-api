var oracledb = require('oracledb');
var jwt = require('jsonwebtoken');
var config = require(__dirname + '../../config.js');
 
function post(req, res, next) {

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
	    
	    console.log(req.body.uname);
            console.log(req.body.barcode);
            connection.execute("Insert into INTERF_IN.EXPIRE_MODIFY ( ART_CODE, BARCODE, ART_DESC, EX_TYPE, EXPIRE_DATE, REQ_QTY, CREATED_DATE ) " +
		" select ART_Code,BARCODE,ART_DESC,nvl(EX_TYPE,1),trunc(EXPIRE_DATE),SUM(REQ_QTY) as qty, current_date"+
                " from INTERF_IN.EXPIRE_LIST "+
                " where SUBSTR(uname,1,length(uname)-1) = SUBSTR(:uname,1,length(:uname)-1)"+
                " AND BARCODE = :barcode AND NVL(Doubt,0)=0"+
                " Group by ART_Code,BARCODE,ART_DESC,nvl(ex_type,1),trunc(EXPIRE_DATE)", 
                {
                    uname: req.body.uname,
		    barcode: req.body.barcode,                       
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
                var msg = {
                    message: 'Successful'
                    };
                    
                var rtn_results= results.rows || msg; 

                    console.log(rtn_results);

                    res.status(200).json(rtn_results.message);

                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("POST /add_Confirm_Expire/" + req.body.uname + "/"+req.body.barcode+" : Connection released " + rtn_results.message );    
                        }
                    });
                });
        }
    );

}
 
module.exports.post = post;
 



