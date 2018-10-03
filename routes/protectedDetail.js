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
 
            connection.execute("SELECT ARTCEXR    AS ART_CODE,"+
                                "  ARTCINR         AS ART_In_Code,"+
                                "  ARTUL.ARUCINL   AS Lu_In_Code,"+
                                "  ARTCOCA.ARCCODE AS Barcode,"+
                                " PKSTRUCOBJ.GET_DESC(1,ARTRAC.ARTCINR,'GB') ART_DESC,"+
                                "  NVL(PKSTOCK.GETSTOCKDISPOENQTE(1,(select SITE FROM INTERF_IN.pck_sites where user_id = :uname AND SITE not like '20%'), ARTUL.ARUCINL),0) AS ART_QTY,"+
                                "  NULL AS REQ_QTY "+
                                " FROM ARTRAC,"+
                                "  ARTUL,"+
                                "  ARTVL,"+
                                "  ARTCOCA"+
                                " WHERE 1                 =1"+
                                " AND ARTETAT            IN (1,5)"+
                                " AND ARTRAC.ARTCINR      = ARTUL.ARUCINR"+
                                " AND ARTVL.ARLCINR       = ARTUL.ARUCINR"+
                                " AND ARTVL.ARLSEQVL      = ARTUL.ARUSEQVL"+
                                " AND ARTUL.ARUCINR       = ARTCOCA.ARCCINR (+)"+
                                " AND ARTUL.ARUCINL       = ARTCOCA.ARCCINV (+)"+
                                " AND ARTCOCA.ARCETAT (+) = 1"+
                                " AND TRUNC(CURRENT_DATE) BETWEEN TRUNC(ARTCOCA.ARCDDEB (+)) AND TRUNC(ARTCOCA.ARCDFIN (+))"+
                                " AND ARCCODE IS NOT NULL"+
                                " AND PKSTOCK.GETSTOCKDISPOENQTE(1,(select SITE FROM INTERF_IN.pck_sites where user_id = :uname AND SITE not like '20%'), ARTUL.ARUCINL) Is Not Null"+
                                " AND ARTCOCA.ARCCODE = :barcode"+
                                " ORDER BY 1,3",

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
 
                    connection.release(function(err) {
                        if (err) {
                            console.error(err.message);
                        }else{
                            console.log("GET /protected_things/?barcode=" + req.query.barcode + "&uname=" + req.query.uname+": Connection released");    
                        }                        
                    });
                }
            );
        }
    );
}
 
module.exports.get = get;
