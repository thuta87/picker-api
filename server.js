var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var compression = require('compression');
var helmet = require('helmet');

var publicThings = require(__dirname + '/routes/publicThings.js');
var checkLists = require(__dirname + '/routes/checkLists.js');
//var protectedThings = require(__dirname + '/routes/protectedThings.js');
var protectedDetail = require(__dirname + '/routes/protectedDetail.js');
var expireInfo = require(__dirname + '/routes/expireInfo.js');
var get_Lists = require(__dirname + '/routes/get_list.js');
var get_Det_Lists = require(__dirname + '/routes/get_list_detail.js');
var get_Expire_Lists = require(__dirname + '/routes/get_expire_list.js');
var get_expire_detail = require(__dirname + '/routes/expireDetail.js');
var get_expire_detail_date = require(__dirname + '/routes/expireDetail_Date.js'); 
var add_Lists = require(__dirname + '/routes/add_list.js');
var add_Expire = require(__dirname + '/routes/add_expire_list.js');
var add_Confirm_Expire = require(__dirname + '/routes/add_confirmed_expire.js');
var add_Edit_Expire= require(__dirname + '/routes/add_edited_expire.js');
var check_Detail = require(__dirname + '/routes/checkDetail.js');
var check_All = require(__dirname + '/routes/checkAll.js');
var confirm_All= require(__dirname + '/routes/confirmAll.js');
var confirm_Exp= require(__dirname + '/routes/confirm_expire.js');
var checkscan= require(__dirname + '/routes/check_scan.js');
var mod_exp= require(__dirname + '/routes/modify_exp.js');
var Del_Exp= require(__dirname + '/routes/delete_exp.js');
var users = require(__dirname + '/routes/users.js');
var logins = require(__dirname + '/routes/logins.js');
var check_Mod = require(__dirname + '/routes/checkMod.js');

var app;
var router;
var port = 3000;
 
app = express();
 
app.use(morgan('combined')); 
//logger
app.use(bodyParser.json());
app.use(compression());
app.use(helmet());
 
router = express.Router();
 
router.get('/public_things', publicThings.get);
//router.get('/protected_things', protectedThings.get);
router.get('/protected_detail', protectedDetail.get);
router.get('/expire_info',expireInfo.get);
router.get('/check_lists', checkLists.get);
router.get('/get_Lists', get_Lists.get);
router.get('/get_Det_Lists', get_Det_Lists.get);
router.get('/get_Expire_Lists', get_Expire_Lists.get);
router.get('/get_expire_detail',get_expire_detail.get);
router.get('/get_expire_detail_date' , get_expire_detail_date.get);
router.get('/check_Mod', check_Mod.get);
router.put('/check_Detail', check_Detail.put);
router.put('/check_All', check_All.put);
router.put('/confirm_All', confirm_All.put);
router.put('/confirm_Exp', confirm_Exp.put);
router.put('/checkscan', checkscan.put);
router.put('/mod_exp' , mod_exp.put );
router.put('/Del_Exp', Del_Exp.put);
router.post('/add_Lists', add_Lists.post);
router.post('/add_Expire', add_Expire.post);
router.post('/add_Confirm_Expire', add_Confirm_Expire.post);
router.post('/add_Edit_Expire', add_Edit_Expire.post);
router.post('/users', users.post);
router.post('/logins', logins.post);

 
app.use('/api', router);
 
app.listen(port, function() {
    console.log('Web server listening on localhost:' + port);
});
