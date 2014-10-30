var socketio = require('socket.io');
var io = socketio.listen(process.env.PORT || 31415);

var percentS = 0;

//Handles clients connecting
var onJoined = function(socket){
	socket.on("helloServer", function(dataIn){
		console.log('client conected');
	
		socket.emit('helloClient', {percent: percentS});
		
		socket.join('room');
	});
};

//Updates all clients when more virus is uploaded
var onVirus = function(socket){
	socket.on('virus', function(dataIn){
		percentS = Math.round((percentS + dataIn.percent) * 100)/100;
		console.log('client uploaded some virus... current level ' + percentS);
		if(percentS >= 100){
			console.log('purging virus...');
			io.sockets.in('room').emit('complete', {percent: percentS});
			percentS = 0;
		}
		io.sockets.in('room').emit('update', {percent: percentS});
		//console.log('update sent');
	});	
};

//Handles clients disconnecting
var onDisconnect = function(socket){
	socket.on('disconnect', function(data){
		console.log('client disconnected');
		socket.leave('room');
	});
};

console.log('listening for clients...');

io.sockets.on('connection', function(socket){
	onJoined(socket);
	onVirus(socket);
	onDisconnect(socket);
});