-- Sử dụng cơ sở dữ liệu btl_iot
USE btl_iot;

-- Bảng User
CREATE TABLE User (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    role VARCHAR(50) NOT NULL
);

-- Bảng Device
CREATE TABLE Device (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT,
    sensor_status INT DEFAULT 0,
    fan_status INT DEFAULT 0,
    led_status INT DEFAULT 0,
    led_brightness INT DEFAULT 7,
    FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
);

-- Bảng Setting
CREATE TABLE Setting (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    lower_temp FLOAT,
    upper_temp FLOAT,
    lower_humid FLOAT,
    upper_humid FLOAT,
    FOREIGN KEY (device_id) REFERENCES Device(id) ON DELETE CASCADE
);

-- Bảng History
CREATE TABLE History (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50),
    temperature FLOAT,
    humidity FLOAT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES Device(id) ON DELETE CASCADE
);

-- FAKE DATA
INSERT INTO User (username, password, name, role)
VALUES 
    ('test1', '123456', 'test1', 'user'),
    ('test2', '123456', 'test2', 'user');

INSERT INTO Device (id, user_id, sensor_status, fan_status, led_status, led_brightness)
VALUES 
    ('1', 1, 0, 0, 0, 7);

INSERT INTO Setting (device_id, lower_temp, upper_temp, lower_humid, upper_humid)
VALUES 
    (1, 10, 20, 10, 90);

INSERT INTO History (device_id, temperature, humidity, timestamp)
VALUES 
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 0 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 10 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 20 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 30 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 40 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 50 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 60 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 70 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 80 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 90 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 100 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 110 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 120 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 130 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 140 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 150 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 160 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 170 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 180 SECOND),
    (1, ROUND(RAND() * 10 + 20, 2), ROUND(RAND() * 30 + 40, 2), NOW() - INTERVAL 190 SECOND);

