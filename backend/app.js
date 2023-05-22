import { sequelize } from "./datasource/datasource.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { usersRouter } from "./routers/users-router.js";
import session from "express-session";
import { meetingsRouter } from "./routers/meetings-router.js";
import { createClient } from "redis";
import { v4 as uuidv4 } from "uuid";
import { stripeRouter } from "./routers/stripe-router.js";
import { config } from "./config.js";

export const app = express();

const isDevMode = config.environment === "development";

// deactivate debug mode in production
const debugMode = isDevMode;

const redisClient = isDevMode
  ? createClient()
  : createClient({ url: "redis://redis:6379" });
await redisClient.connect();

// parse body as json unless the endpoint starts with "/api/stripe/webhook"
app.use((req, res, next) => {
  if (req.path.startsWith("/api/stripe/webhook")) {
    next();
  } else {
    bodyParser.json()(req, res, next);
  }
});

const corsOptions = {
  origin: config.clientURL,
  credentials: true,
};
app.use(cors(corsOptions));

const httpServer = http.createServer(app);

try {
  await sequelize.authenticate();
  await sequelize.sync({ alter: { drop: false } });
  console.log("Connection established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

const io = new Server(httpServer, {
  cors: {
    origin: config.clientURL,
    methods: ["GET", "POST"],
  },
});

io.on("connection", async (socket) => {
  socket.on("join", (room) => {
    socket.join(room);
    const messageList = redisClient.lRange(`socket.io#${room}`, 0, -1);
    messageList.then((messages) => {
      messages = messages.reverse();
      messages.forEach((message) => {
        socket.emit("message", JSON.parse(message));
      });
    });
    io.to(room).emit("prop", "base");
  });

  socket.on("message", (messageInfo) => {
    // check that messageInfo has a room and message
    if (!messageInfo.room || !messageInfo.message) {
      return;
    }
    redisClient.lPush(
      `socket.io#${messageInfo.room}`,
      JSON.stringify(messageInfo.message)
    );
    io.to(messageInfo.room).emit("message", messageInfo.message);
  });

  socket.on("prop", (messageInfo) => {
    // check that messageInfo has a room and type
    if (!messageInfo.room && !messageInfo.type) {
      return;
    }
    io.to(messageInfo.room).emit("prop", messageInfo.type);
  });

  socket.on("color", (messageInfo) => {
    // check that messageInfo has a room and type
    if (!messageInfo.room && !messageInfo.type) {
      return;
    }
    io.to(messageInfo.room).emit("color", messageInfo.type);
  });

  socket.on("environment", (messageInfo) => {
    // check that messageInfo has a room and type
    if (!messageInfo.room && !messageInfo.type) {
      return;
    }
    io.to(messageInfo.room).emit("environment", messageInfo.type);
  });

  socket.on("leave", (messageInfo) => {
    if (!messageInfo.room) {
      return;
    }
    socket.leave(messageInfo.room);
  });

  socket.on("host-leave", (messageInfo) => {
    if (!messageInfo.room) {
      return;
    }
    io.to(messageInfo.room).emit("host-leave");
  });

  socket.on("guest-leave", (messageInfo) => {
    if (!messageInfo.room) {
      return;
    }
    io.to(messageInfo.room).emit("guest-leave");
  });

  socket.on("move-peer-model", (messageInfo) => {
    if (!messageInfo.room || !messageInfo.position || !messageInfo.yaw) {
      return;
    }
    socket
      .to(messageInfo.room)
      .emit("move-peer-model", messageInfo.position, messageInfo.yaw);
  });
  socket.on("disconnect", () => {});
});

app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true,
  })
);

// Print all HTTP requests for debugging
if (debugMode) {
  app.use(function (req, res, next) {
    console.log("HTTP request", req.method, req.url, req.body);
    next();
  });
}

app.use("/api/users", usersRouter);
app.use("/api/meetings", meetingsRouter);
app.use("/api/stripe", stripeRouter);

httpServer.listen(config.port, (err) => {
  if (err) console.log(err);
  else console.log("HTTP server on http://localhost:%s", config.port);
});
