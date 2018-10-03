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
 
            connection.execute(
                "insert into INTERF_IN.expire_list ( " +
                "   ART_CODE, BARCODE, ART_DESC, REQ_QTY, UNAME,CREATED_DATE,MODIFIED_DATE,EXPIRE_DATE,EX_TYPE, CINR ,CINL " +
                ") values (:acode,:abarcode,:adesc,:rqty,:uname,current_date,current_date,to_char(to_date(:edate,'YYYY-MM-DD'),'DD-Mon-YYYY'),:ex_type,:artcinr,:artcinl)",
                {
                    acode: req.body.art_code,
                    abarcode: req.body.barcode,
                    adesc: req.body.art_desc,                    
                    rqty: req.body.req_qty,
                    uname: req.body.uname,   
                    edate: req.body.edate,
		    ex_type: req.body.ex_type,
		    artcinr: req.body.artcinr,
		    artcinl: req.body.artcinl,
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
			    console.log("Expire Status : "+req.body.ex_type);	
                            console.log( req.body.art_code + " " + req.body.barcode + " " + req.body.art_desc + " " + req.body.req_qty + " " + req.body.uname);    
                            console.log("POST /add_Expire/" + req.body.req_qty + "/"+req.body.ex_type+"/"+req.body.artcinr+"/"+req.body.artcinl+" : Connection released " + rtn_results.message );    
                        }
                    });
                });
        }
    );

}
 
module.exports.post = post;
 



