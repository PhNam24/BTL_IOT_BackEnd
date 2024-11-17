-- Tạo bảng User
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    attribute VARCHAR(50) -- Lưu vai trò (admin/user)
);

-- Tạo bảng Fan
CREATE TABLE Fan (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status INT
);

-- Tạo bảng Speaker
CREATE TABLE Speaker (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status INT
);

-- Tạo bảng Sensor
CREATE TABLE Sensor (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status INT
);

-- Tạo bảng Led
CREATE TABLE Led (
    id INT PRIMARY KEY AUTO_INCREMENT,
    des VARCHAR(255),
    status INT,
    led_brightness INT,
    led_text_size INT
);

-- Tạo bảng Device
CREATE TABLE Device (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    sensor_id INT,
    fan_id INT,
    speaker_id INT,
    note VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id),
    FOREIGN KEY (fan_id) REFERENCES Fan(id),
    FOREIGN KEY (speaker_id) REFERENCES Speaker(id)
);

-- Tạo bảng History
CREATE TABLE History (
    id INT PRIMARY KEY AUTO_INCREMENT,
    humidity FLOAT,
    temperature FLOAT,
    timestamp DATETIME,
    sensor_id INT,
    FOREIGN KEY (sensor_id) REFERENCES Sensor(id)
);

-- Tạo bảng Setting
CREATE TABLE Setting (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lower_humid FLOAT,
    upper_humid FLOAT,
    lower_temp FLOAT,
    upper_temp FLOAT,
    device_id INT,
    FOREIGN KEY (device_id) REFERENCES Device(id)
);