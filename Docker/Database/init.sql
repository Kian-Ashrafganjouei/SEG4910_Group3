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
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    review_score INT DEFAULT 3 CHECK (review_score BETWEEN 1 AND 5)
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

CREATE TABLE interests (
    interest_id SERIAL PRIMARY KEY,  
    name VARCHAR(100) NOT NULL UNIQUE 
);


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
    trip_id INT REFERENCES Trips(trip_id) ON DELETE CASCADE,
    role VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('requested', 'joined', 'declined', 'created')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE UserTrips ADD CONSTRAINT unique_user_trip UNIQUE (user_id, trip_id);

-- Create a function for the trigger
CREATE OR REPLACE FUNCTION insert_user_trip()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert a new record into UserTrips table
    INSERT INTO UserTrips (user_id, trip_id, role, status, created_at)
    VALUES (NEW.created_by, NEW.trip_id, 'creator', 'created', CURRENT_TIMESTAMP);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
CREATE TRIGGER after_trip_insert
AFTER INSERT ON Trips
FOR EACH ROW
EXECUTE FUNCTION insert_user_trip();

-- Posts Table
CREATE TABLE Posts (
    post_id SERIAL PRIMARY KEY,
    usertrip_id INT REFERENCES UserTrips(user_trip_id) ON DELETE CASCADE,
    caption TEXT NOT NULL,
    image VARCHAR(255) NOT NULL,
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
    post_id INT REFERENCES Posts(post_id) ON DELETE CASCADE,
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

-- Notifications Table
CREATE TABLE Notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger: Automatically notify trip creators when a user requests to join their trip
CREATE OR REPLACE FUNCTION notify_trip_creator() RETURNS TRIGGER AS $$
DECLARE
    requester_name TEXT;
    trip_location TEXT;
BEGIN
    -- Get the name of the user making the request
    SELECT name INTO requester_name FROM Users WHERE user_id = NEW.user_id;
    
    -- Get the trip location
    SELECT location INTO trip_location FROM Trips WHERE trip_id = NEW.trip_id;

    -- Insert the notification with the custom message
    INSERT INTO Notifications (user_id, message)
    VALUES (
        (SELECT created_by FROM Trips WHERE trip_id = NEW.trip_id),
        requester_name || ' has requested to join your trip to ' || trip_location || '.'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_trip_creator
AFTER INSERT ON UserTrips
FOR EACH ROW
WHEN (NEW.status = 'requested')
EXECUTE FUNCTION notify_trip_creator();

-- Create the updated function
CREATE OR REPLACE FUNCTION notify_user_trip_status() RETURNS TRIGGER AS $$
DECLARE
    trip_location TEXT;
    trip_creator_name TEXT;
    status_message TEXT;
BEGIN
    -- Get the trip location
    SELECT location INTO trip_location FROM Trips WHERE trip_id = NEW.trip_id;

    -- Get the name of the trip creator
    SELECT name INTO trip_creator_name FROM Users
    WHERE user_id = (SELECT created_by FROM Trips WHERE trip_id = NEW.trip_id);

    -- Determine the appropriate status message
    IF NEW.status = 'joined' THEN
        status_message := 'accepted';
    ELSE
        status_message := NEW.status;
    END IF;

    -- Insert the notification with the custom message
    INSERT INTO Notifications (user_id, message)
    VALUES (
        NEW.user_id,
        'Your trip request to ' || trip_location || ' has been ' || status_message || ' by ' || trip_creator_name || '.'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the updated trigger
CREATE TRIGGER trigger_notify_user_trip_status
AFTER UPDATE ON UserTrips
FOR EACH ROW
WHEN (OLD.status = 'requested' AND NEW.status IN ('joined', 'declined'))
EXECUTE FUNCTION notify_user_trip_status();


--INSERT VALUES BELOW-------------------------------------------------------

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

INSERT INTO Users (
    username, name, email, password, phone_number, nationality, age, sex, bio, profile_picture
) 
VALUES (
    'johndoe', 
    'John Doe', 
    'johndoe@example.com', 
    'password123', 
    '+1234567890', 
    'Canadian', 
    30, 
    'Male', 
    'Software engineer with a passion for travel and photography.', 
    'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg'
);

INSERT INTO Users (
    username, name, email, password, profile_picture
) 
VALUES (
    'test', 
    'John Test', 
    'test@example.com', 
    'test',
    'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg'
);

INSERT INTO Users (
    username, name, email, password, profile_picture
) 
VALUES (
    'ekoro061', 
    'Lisa Koro', 
    'ekoro061@uottawa.ca', 
    'temp',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Sarah_Douglas_Photo_Op_GalaxyCon_Richmond_2023.jpg/220px-Sarah_Douglas_Photo_Op_GalaxyCon_Richmond_2023.jpg'
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

INSERT INTO Trips (
    location, start_date, end_date, description, created_by
) 
VALUES (
    'Moscow, Russia', 
    '2024-12-11', 
    '2024-12-14', 
    'Drinking vodka with bears while wearing a fuzzy hat in -30°C.', 
    2 
);

INSERT INTO Trips (
    location, start_date, end_date, description, created_by
) 
VALUES (
    'Tehran, Iran', 
    '2024-12-17', 
    '2024-12-28', 
    'Trip to try Persian cusine.', 
    2 
);

INSERT INTO Trips (
    location, start_date, end_date, description, created_by
) 
VALUES (
    'Oslo, Norway', 
    '2025-6-17', 
    '2025-6-28', 
    'Viking adventure in Scandinavian mountains.', 
    2 
);

INSERT INTO UserTrips (user_id, trip_id, status)
VALUES 
    (2, 1, 'requested')
ON CONFLICT (user_id, trip_id) DO UPDATE SET status = 'requested';

INSERT INTO UserTrips (user_id, trip_id, status)
VALUES 
    (2, 2, 'joined')
ON CONFLICT (user_id, trip_id) DO UPDATE SET status = 'joined';

INSERT INTO Posts (usertrip_id, caption, image)
VALUES (1, 'Loving the beautiful Eiffel Tower views!', 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg');

INSERT INTO Posts (usertrip_id, caption, image)
VALUES (2, 'Exploring Moscow’s Red Square', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/0169_-_Moskau_2015_-_Roter_Platz_%2825795529393%29.jpg/800px-0169_-_Moskau_2015_-_Roter_Platz_%2825795529393%29.jpg');

INSERT INTO Reviews (reviewer_id, post_id, rating, comment) 
VALUES 
    (1, 1, 5, 'Had an amazing time in Paris! The Eiffel Tower was breathtaking and the food was out of this world!'),
    (2, 1, 1, 'John was pretty inconsiderate. He made plans without even consulting some of us, which kinda defeats the purpose of making this a group trip in the first place.')
