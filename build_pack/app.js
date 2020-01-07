// 拦截所有未捕获异常防止node崩溃
process.on('unhandledRejection', (reason, p) => {
	console.error(reason, 'Unhandled Rejection at Promise', p);
}).on('uncaughtException', err => {
	console.error(err, 'Uncaught Exception thrown');
});
var http_service = require("./http_service");
var socket_service = require("./socket_service");
var client_service = require("./client_service");
var room_service = require("./room_service");
var as = require('./account_server');
var dapi = require('./dealer_api');
var db = require('../utils/db');
var configs = require(process.argv[2]);
var server_name = process.argv[3];
switch (server_name) {
case 'game_server':
	// =========================游戏服============================
	//从配置文件获取服务器信息
	var config = configs.game_server();
	db.init(configs.mysql());
	//开启HTTP服务
	http_service.start(config);
	//开启外网SOCKET服务
	socket_service.start(config);
	break;
case 'hall_server':
	// =========================大厅服============================
	var config = configs.hall_server();
	db.init(configs.mysql());
	client_service.start(config);
	room_service.start(config);
	break;
case 'account_server':
	// =========================账号服============================
	db.init(configs.mysql());
	var config = configs.account_server();
	as.start(config);
	dapi.start(config);
	break;
}