const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const { client: mqttClient, connect, message } = require("./config/mqtt/mqtt");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  // Publish messages
  req.mqttPublish = function (topic, message) {
    mqttClient.publish(topic, message);
  };
  // Subscribe to topic
  req.mqttSubscribe = function (topic, callback) {
    mqttClient.subscribe(topic);
    mqttClient.on("message", function (t, m) {
      if (t === topic) {
        callback(m.toString());
      }
    });
  };
  next();
});

// Start server
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
  // Connect to mqtt broker
  connect();
  message();
});

let deviceId = 1;

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  // // Lắng nghe sự kiện yêu cầu dữ liệu lịch sử từ client
  // socket.on("requestHistory", async (data) => {
  //   const { user_id, device_id, page = 1, limit = 10 } = data;

  //   console.log(
  //     `Received requestHistory from user_id: ${user_id}, device_id: ${device_id}, page: ${page}, limit: ${limit}`
  //   );

  //   try {
  //     // Gọi hàm getData từ HistoryController
  //     const historyData = await HistoryController.getData(
  //       user_id,
  //       device_id,
  //       page,
  //       limit
  //     );

  //     // Gửi dữ liệu về cho client
  //     socket.emit("receiveHistory", historyData);
  //   } catch (error) {
  //     console.error("Error fetching history data:", error);
  //     // Gửi lỗi về cho client
  //     socket.emit("historyError", error);
  //   }
  // });
  mqttClient.on("message", (topic, message) => {
    const json = JSON.parse(message);
    if (topic === "data" && json.deviceId === deviceId) {
      const object = { new_temp: json.temp, new_humid: json.humid };
      console.log("Emit in data channel", object);
      socket.emit("data", object);
    }
  });

  socket.on("info", (data) => {
    deviceId = data.device_id;
  });

  socket.on("mesage", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
