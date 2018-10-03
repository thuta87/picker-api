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
                'insert into INTERF_IN.check_lists ( ' +
                '   ART_CODE, BARCODE, ART_DESC, ART_QTY, REQ_QTY, UNAME,CREATED_DATE,MODIFIED_DATE,LOCATION,LU_IN_CODE,ART_IN_CODE ' +
                ') values (:acode,:abarcode,:adesc,:aqty,:rqty,:uname,current_date,current_date,:location,:Lu_In_Code,:Art_In_Code) ',
                {
                    acode: req.body.art_code,
                    abarcode: req.body.barcode,
                    adesc: req.body.art_desc,
                    aqty: req.body.art_qty,         
                    rqty: req.body.req_qty,
                    uname: req.body.uname,
		    location: req.body.location,   
		    Lu_In_Code: req.body.Lu_In_Code,
		    Art_In_Code: req.body.Art_In_Code,			
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
                            console.log("POST /add_Lists/" + req.body.req_qty + "/"+req.body.location+" : Connection released " + rtn_results.message );    
                        }
                    });
                });
        }
    );

}
 
module.exports.post = post;
 



