var express = require('express'),
    app = express(),
    http = require('http'),
    https = require('https'),
    socketIO = require('socket.io'),
    fs = require('fs'),
    path = require('path'),
    server, io, sockets = [];
var passphrase = "Droplet-05-01";

app.use(express.static(__dirname));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/indexv03.html');
});

// server = http.Server(app);
// server.listen(6000);

server = https.createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: passphrase
}, app).listen(5000);

console.log('Listening on port 5000');

io = socketIO(server);

io.on('connection', function (socket) {

    socket.emit('add-users', {
        users: sockets
    });

    socket.broadcast.emit('add-users', {
        users: [socket.id]
    });

    socket.on('make-offer', function (data) {
        socket.to(data.to).emit('offer-made', {
            offer: data.offer,
            socket: socket.id
        });
    });

    socket.on('make-answer', function (data) {
        socket.to(data.to).emit('answer-made', {
            socket: socket.id,
            answer: data.answer
        });
    });

    socket.on('disconnect', function () {
        sockets.splice(sockets.indexOf(socket.id), 1);
        io.emit('remove-user', socket.id);
    });


    socket.on('message.send', function (data){
        io.emit('message.sent', data);
    });

    sockets.push(socket.id);

});
