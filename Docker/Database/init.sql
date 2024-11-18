---------------------------- DATABASE SETUP ---------------------------------------------
-- Create the root superuser and database to supress PG's warnings.
CREATE USER root superuser;
ALTER USER root WITH PASSWORD 'password';
CREATE DATABASE root;

-- Create a new database --
CREATE DATABASE main;
\connect main;

-- Users table remains unchanged
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(15),
    nationality VARCHAR(50),
    age INT,
    sex VARCHAR(10),
    bio TEXT,
    profile_picture VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Users (
    username, name, email, password, phone_number, nationality, age, sex, bio, profile_picture
) 
VALUES (
    'johndoe', 
    'John Doe', 
    'johndoe@example.com', 
    'hashed_password123', 
    '+1234567890', 
    'Canadian', 
    30, 
    'Male', 
    'Software engineer with a passion for travel and photography.', 
    'profile_pictures/johndoe.jpg'
);

INSERT INTO Users (
    username, name, email, password
) 
VALUES (
    'test', 
    'John Doe', 
    'test@example.com', 
    'test'
);

-- Create a new join table for user languages
CREATE TABLE User_Languages (
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    language VARCHAR(255),
    PRIMARY KEY (user_id, language)
);

CREATE TABLE user_interests (
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    interest VARCHAR(255),
    PRIMARY KEY (user_id, interest)
);

-- Trips Table
CREATE TABLE Trips (
    trip_id SERIAL PRIMARY KEY,
    location VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    created_by INT REFERENCES Users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Trips (
    location, start_date, end_date, description, created_by
) 
VALUES (
    'Paris, France', 
    '2024-12-15', 
    '2024-12-22', 
    'Christmas vacation exploring Paris.', 
    2 
);

CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,  
    name VARCHAR(100) NOT NULL UNIQUE 
);

-- Insert preset interests
INSERT INTO interests (name) VALUES 
('Adventure'),
('Cultural Experiences'),
('Nature and Hiking'),
('Food and Wine Tasting'),
('Beach and Relaxation'),
('Nightlife and Entertainment'),
('Historical Sites'),
('Shopping'),
('Sports and Activities'),
('Photography'),
('Wellness and Spa'),
('Music and Festivals');


CREATE TABLE trip_interests (
    trip_interest_id SERIAL PRIMARY KEY,
    trip_id INT NOT NULL REFERENCES Trips(trip_id) ON DELETE CASCADE,
    interest_id INT NOT NULL REFERENCES interests(interest_id) ON DELETE CASCADE,
    UNIQUE (trip_id, interest_id)
);

-- UserTrips Table
CREATE TABLE UserTrips (
    user_trip_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id),
    trip_id INT REFERENCES Trips(trip_id),
    role VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('requested', 'joined', 'declined')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE UserTrips ADD CONSTRAINT unique_user_trip UNIQUE (user_id, trip_id);

INSERT INTO UserTrips (
    user_id, trip_id, status
) 
VALUES (
    1, 
    1, 
    'requested'
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
