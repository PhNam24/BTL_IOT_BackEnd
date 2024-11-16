-- Tạo bảng User
CREATE TABLE User (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    attribute VARCHAR(50) -- Để lưu role (admin/user)
);

-- Tạo bảng Setting
CREATE TABLE Setting (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lower_humid FLOAT,
    upper_humid FLOAT,
    lower_temp FLOAT,
    upper_temp FLOAT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES User(id)
);

-- Tạo bảng Led
CREATE TABLE Led (
    id INT PRIMARY KEY AUTO_INCREMENT,
    des TEXT,
    status INTEGER,
    led_brightness INTEGER,
    led_text_size INTEGER
);

-- Tạo bảng History
CREATE TABLE History (
    id INT PRIMARY KEY AUTO_INCREMENT,
    humidity FLOAT,
    temperature FLOAT,
    timestamp DATETIME
);

-- Tạo bảng Sensor
CREATE TABLE Sensor (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status INTEGER
);

-- Thêm tài khoản admin vào bảng User
INSERT INTO User ( name, email, username, password, attribute)
VALUES ('admin', NULL, 'admin', 'iotproject123', 'admin');
