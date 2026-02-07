const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const connectDB = require("./config/db");
const seedLeaderboardUsers = require("./config/seedLeaderboard");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");
const registerChatSocket = require("./socket/chatSocket");

const app = express();
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());

// routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/pins", require("./routes/pinRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/guards", require("./routes/guardRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "API healthy" });
});

app.get("/", (req, res) => {
  res.send("Spotty backend is live 🚀");
});

// error handlers (LAST)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});
registerChatSocket(io);

const startServer = async () => {
  await connectDB();
  await seedLeaderboardUsers();
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
