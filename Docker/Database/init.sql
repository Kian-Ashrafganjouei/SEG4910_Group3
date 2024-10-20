---------------------------- DATABASE SETUP ---------------------------------------------
-- Create the root superuser and database to supress PG's warnings.
CREATE USER root superuser;
ALTER USER root WITH PASSWORD 'password';
CREATE DATABASE root;

-- Create a new database --
CREATE DATABASE main;
\connect main;

-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(15),
    nationality VARCHAR(50),
    languages VARCHAR(255),
    age INT,
    sex VARCHAR(10),
    interests TEXT,
    bio TEXT,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips Table
CREATE TABLE Trips (
    trip_id SERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_by INT REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UserTrips Table
CREATE TABLE UserTrips (
    user_trip_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    trip_id INT REFERENCES Trips(trip_id),
    role VARCHAR(50),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts Table
CREATE TABLE Posts (
    post_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    content TEXT NOT NULL,
    location VARCHAR(100),
    interests VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments Table
CREATE TABLE Comments (
    comment_id SERIAL PRIMARY KEY,
    post_id INT REFERENCES Posts(post_id),
    user_id INT REFERENCES Users(user_id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE Messages (
    message_id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES Users(user_id),
    receiver_id INT REFERENCES Users(user_id),
    content TEXT NOT NULL,
    read_status VARCHAR(20) DEFAULT 'Unread',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Friendships Table
CREATE TABLE Friendships (
    friendship_id SERIAL PRIMARY KEY,
    user_id_1 INT REFERENCES Users(user_id),
    user_id_2 INT REFERENCES Users(user_id),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews Table
CREATE TABLE Reviews (
    review_id SERIAL PRIMARY KEY,
    reviewer_id INT REFERENCES Users(user_id),
    reviewee_id INT REFERENCES Users(user_id),
    trip_id INT REFERENCES Trips(trip_id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events Table
CREATE TABLE Events (
    event_id SERIAL PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_by INT REFERENCES Users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- UserEvents Table
CREATE TABLE UserEvents (
    user_event_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    event_id INT REFERENCES Events(event_id),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
