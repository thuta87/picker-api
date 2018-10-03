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
 	    /*
            connection.execute("SELECT * FROM INTERF_IN.expire_list Where UNAME= :uname AND"+
                " trunc(CREATED_DATE)=to_char(to_date(:cdate,'YYYY-MM-DD'),'DD-Mon-YYYY') AND NVL(Doubt,0)=0"+
                                " Order by Created_Date",
	    */
		connection.execute("SELECT ART_CODE,BARCODE,ART_DESC,REQ_QTY,UNAME,DOUBT,CREATED_DATE,MODIFIED_DATE,EX_TYPE,Case When EX_Type=2 then Null else EXPIRE_DATE end as EXPIRE_DATE" +
					" FROM INTERF_IN.expire_list Where UNAME= :uname AND " +
			                " trunc(CREATED_DATE)=to_char(to_date(:cdate,'YYYY-MM-DD'),'DD-Mon-YYYY') AND NVL(Doubt,0)=0 " +
                                 "Order by Created_Date",

                {
                    uname: req.query.uname,
                    cdate: req.query.cdate
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
 
                    res.status(200).json(results.rows);
 
                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("GET /get_expire_list/?uname=" + req.query.uname + "&cdate="+req.query.cdate+" : Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.get = get;
