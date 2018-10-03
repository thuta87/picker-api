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
 
            connection.execute("select ART_Code,BARCODE,ART_DESC,nvl(EX_TYPE,1) as estatus, Case When nvl(EX_TYPE,1)=1 Then 'Expire Date' Else (Case When nvl(EX_TYPE,1)=2 Then 'No Date' Else (Case When nvl(EX_TYPE,1)=3 Then 'Manufacture Date' Else ' ' End) End) End as eDesp,trunc(EXPIRE_DATE) as edate,SUM(REQ_QTY) as total_qty"+
                                " from INTERF_IN.EXPIRE_LIST "+
                                " where SUBSTR(uname,1,length(uname)-1) = SUBSTR(:uname,1,length(:uname)-1)"+
                                " AND BARCODE = :barcode AND NVL(Doubt,0)=0"+
                                " Group by ART_Code,BARCODE,ART_DESC,nvl(ex_type,1),trunc(EXPIRE_DATE)",

                //" SELECT ARCCODE as Barcode,ARTUL.ARUCINL as LU_In_Code,ARTRAC.ARTCINR as ART_In_Code ,ARTRAC.ARTCEXR as ART_CODE,PKSTRUCOBJ.GET_DESC(1,ARTRAC.ARTCINR,'GB') ART_DESC, NVL(PKSTOCK.GETSTOCKDISPOENQTE(1,30001, ARTUL.ARUCINL),0) AS ART_QTY   FROM ARTRAC,ARTUL,ARTCOCA " +
                //" WHERE ARTRAC.ARTCINR=ARTUL.ARUCINR AND ARTCOCA.ARCCINR=ARTRAC.ARTCINR AND (TRUNC(CURRENT_DATE) BETWEEN ARCDDEB AND ARCDFIN) " +
                //" AND ARCCODE Like :barcode",
                {
                    barcode: req.query.barcode,
                    uname: req.query.uname
                },//bind with import barcode
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
		    console.log(results.rows);
 
                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("GET /get_expire_detail/?barcode=" + req.query.barcode + "&uname=" + req.query.uname+": Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.get = get;
