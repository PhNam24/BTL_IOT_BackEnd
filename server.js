const express = require("express");
const bodyParser = require("body-parser");
const cor = require("cors");
const http = require("http");
const socketIo = require("socket.io");

const { client: mqttClient, connect, message } = require("./config/mqtt/mqtt");

const app = express();
const port = 3000;


// Middleware
app.use(bodyParser.json());
app.use(cor({
      origin: true,
      credentials: true,
      }
));
app.use("/user", require("./routes/user"));
app.use("/device", require("./routes/device"));
app.use("/history", require("./routes/history"));

const server = http.createServer(app);
const io = socketIo(server);

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

io.on("connection", (socket) => {
  console.log("a user connected");

  // Lắng nghe sự kiện yêu cầu dữ liệu lịch sử từ client
  socket.on("requestHistory", async (data) => {
    const { user_id, device_id, page = 1, limit = 10 } = data;

    console.log(`Received requestHistory from user_id: ${user_id}, device_id: ${device_id}, page: ${page}, limit: ${limit}`);

    try {
        // Gọi hàm getData từ HistoryController
        const historyData = await HistoryController.getData(user_id, device_id, page, limit);
        
        // Gửi dữ liệu về cho client
        socket.emit("receiveHistory", historyData);
    } catch (error) {
        console.error("Error fetching history data:", error);
        // Gửi lỗi về cho client
        socket.emit("historyError", error);
    }
});

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});