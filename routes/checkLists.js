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
 
            connection.execute(
                " SELECT ARCCODE as Barcode,ARTUL.ARUCINL as Ex_Code,ARTRAC.ARTCINR as In_Code ,ARTRAC.ARTCEXR as ART_CODE,PKSTRUCOBJ.GET_DESC(1,ARTRAC.ARTCINR,'GB') ART_DESC, NVL(PKSTOCK.GETSTOCKDISPOENQTE(1,30001, ARTUL.ARUCINL),0) AS ART_QTY   FROM ARTRAC,ARTUL,ARTCOCA " +
                " WHERE ARTRAC.ARTCINR=ARTUL.ARUCINR AND ARTCOCA.ARCCINR=ARTRAC.ARTCINR AND (TRUNC(CURRENT_DATE) BETWEEN ARCDDEB AND ARCDFIN) ",
                {                    
                },//bind with nothing
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
                            console.log("GET /check lists/ : Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.get = get;