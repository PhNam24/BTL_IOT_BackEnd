const mqtt = require("mqtt");
const db = require("../db/mysql");
const { getDevices } = require("../../controller/DeviceController");
const { getSettingByDeviceId } = require("../../controller/SettingController");

const connectURL =
  "mqtt://e8faa1c0f8174e3db1d82dd501f86d7c.s1.eu.hivemq.cloud:8884/mqtt";
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;

console.log("clientId", clientId);

const options = {
  clientId,
  clean: true,
  protocol: "wss",
  username: "wind2715",
  password: "123456789Hanoi",
};

const client = mqtt.connect(connectURL, options);
const topics = ["data", "state", "setting"];

function connect() {
  client.on("connect", async () => {
    console.log("Connected to Mqtt Broker");
    topics.forEach((value, index) => {
      client.subscribe(`${value}`, (error) => {
        if (error) {
          console.error("Subscription Failed", error);
        } else {
          console.log(`Subscribe To ${value}`);
        }
      });
    });

    let devices = await getDevices();
    for (const element of devices) {
      let setting = await getSettingByDeviceId(element.id);

      client.publish(
        "state",
        JSON.stringify({
          deviceId: element.id,
          led_state: element.led_status,
          fan_state: element.fan_status,
          brightness: element.led_brightness,
        })
      ),
        (error) => {
          console.error("Publish Failed", error);
        };
      client.publish(
        "setting",
        JSON.stringify({
          deviceId: setting.device_id,
          lower_temp: setting.lower_temp,
          upper_temp: setting.upper_temp,
          lower_humid: setting.lower_humid,
          upper_humid: setting.upper_humid,
        })
      ),
        (error) => {
          console.error("Publish Failed", error);
        };

      client.on("error", (error) => {
        console.error("connection failed", error);
      });
    }
  });
}

function reconnect() {
  client.on("reconnect", (error) => {
    console.error("reconnect failed", error);
  });
}

function message() {
  var query =
    "INSERT INTO History (humidity, temperature, timestamp, device_id) VALUES (?, ?, ?, ?)";

  client.on("message", (topic, payload) => {
    console.log("Received Message:", topic, payload.toString());
    try {
      var json = JSON.parse(payload);
      if (topic == "data") {
        var sensor_id = json.deviceId.toString();
        var humidity = json.humid;
        var temperature = json.temp;
        var time_update = new Date(); // Lấy thời gian hiện tại

        db.query(
          query,
          [humidity, temperature, time_update, sensor_id],
          function (err, result) {
            if (err) throw err;
            console.log(
              "Number of records inserted to history: " + result.affectedRows
            );
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  });
}

module.exports = {
  client,
  connect,
  message,
};
