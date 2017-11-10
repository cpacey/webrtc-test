var restify = require('restify');
var socketio = require('socket.io');

function respond(req, res, next) {
  res.send('hello ' + req.params.name);
  next();
}

var server = restify.createServer();
var io = socketio.listen(server.server);

server.get( '/hello/:name', respond );
server.get(/\/public\/?.*/, restify.plugins.serveStatic({
    directory: __dirname
}));

var sockets = [];

function startAll( data ) {
  console.log( 'starting' );
  sockets.forEach( socket => {
    socket.emit( 'go', {} );
  } );
}

io.sockets.on('connection', socket => {
  console.log( 'connection' );
  sockets.push( socket );
  socket.on( 'start', startAll );
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
