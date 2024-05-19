var createError = require('http-errors');
var express = require('express');
var path = require('path');
var morgan = require('morgan');
const config = require('./config')();
const cors = require("cors");
process.env.PORT = config.port;
const { Server } = require("socket.io");
const http = require("http");


const server = http.createServer(app);

const io = new Server(server, {
	cors: {
		origin: "http://localhost:3002",
		methods: ["GET","POST"],
	},
});

io.on("connection", (socket) => {
	console.log(socket.id);

	socket.on("join_room", (data) => {
		socket.join(data)
		console.log(data)
	})

	socket.on("send_message", (data) => {
		socket.to(data.room).emit("receive_message", data)
	});

	socket.on("disconnect", () => {
		console.log("User Disconnect: ", socket.id);
	});
});

server.listen(3005, ()=>{
	console.log("socket connected server running")
})

//var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
var authorizeRouter = require('./routes/authorize/authorize');
var sportsRouter = require('./routes/sports/sports');
var loginRouter = require('./routes/login/login');
var signupRouter = require('./routes/signup/signup');
var locationRouter = require('./routes/location/location');
var profileRouter = require('./routes/profile/profile');
var searchRouter = require('./routes/search/search');
var teamsRouter = require('./routes/teams/teams');
var chatRouter = require('./routes/chat/chat');
var resultRouter = require('./routes/result/result');
var blockRouter = require('./routes/block/block');
var notificationRouter = require('./routes/notification/notification');

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

//app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static('images'));

//app.use('/', indexRouter);
// app.use('/users', usersRouter);
app.use('/authorize', authorizeRouter);
app.use('/sports', sportsRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/location', locationRouter);
app.use('/profile', profileRouter);
app.use('/search', searchRouter);
app.use('/teams', teamsRouter);
app.use('/chat', chatRouter);
app.use('/result', resultRouter);
app.use('/block', blockRouter);
app.use('/notification', notificationRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({message:"error! page not found!"});
  //res.render('error');
});

module.exports = app;
