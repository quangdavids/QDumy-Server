const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const helmet = require("helmet")
const { rateLimit } = require("express-rate-limit");
const http = require('http')
const { Server } = require('socket.io')

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  },
  pingTimeout: 60000,
});

connectDB();

app.use(helmet())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
);

app.set('socketio', io);

// Socket.io connection handler

io.on('connection', (socket) => {
  socket.on('join-room', (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`User ${userId} joined their private notification room`);
  });

  socket.on('error', (err) => {
    console.error(`Socket error for ${socket.id}:`, err);
  });

  socket.on('disconnect', (reason) => {
    console.log(`User disconnected (${reason}): ${socket.id}`);
  });
});




// Import routes
const courseRoute = require("./routes/courseRoute");
const authRoute = require("./routes/authRoute");
const lecturerRoute = require("./routes/lecturerRoute")
const paymentRoute = require("./routes/paymentRoute")
const cartRoute = require("./routes/cartRoute")
const userRoute = require("./routes/userRoute")
const aiRoute = require("./routes/aiRoute")
const reviewRoute = require("./routes/reviewRoute")
const adminRoute = require("./routes/adminRoute")
const courseCompletionRoute = require("./routes/courseCompletionRoute")
const revenueRoute = require("./routes/revenueRoute")
const notificationRoute = require('./routes/notificationRoute');
const { Socket } = require("dgram");
// Set up routes
app.use("/api", courseRoute);
app.use("/auth", authRoute);
app.use("/api", lecturerRoute)
app.use("/api", reviewRoute)
app.use("/api/payment",paymentRoute)
app.use("/api/cart", cartRoute)
app.use("/api/user", userRoute)
app.use("/api/ai", aiRoute)
app.use("/api", adminRoute)
app.use("/api", courseCompletionRoute)
app.use("/api", revenueRoute)
app.use("/api", notificationRoute) 
// Set up Cloudinary
app.use("/api/uploads", express.static("uploads"));
// Set up the server to listen on a specific port

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log("Server listening at " + port);

});
