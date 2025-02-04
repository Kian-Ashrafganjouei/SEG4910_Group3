package backend;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import backend.model.Interest;
import backend.model.Post;
import backend.model.Trip;
import backend.model.User;
import backend.model.UserTrips;
import backend.repository.InterestRepository;
import backend.repository.PostRepository;
import backend.repository.TripRepository;
import backend.repository.UserRepository;
import backend.repository.UserTripsRepository;
import jakarta.transaction.Transactional;


// Declares this class as a REST controller and Spring Boot application
@RestController
@SpringBootApplication
public class BackendApplication {

    @Autowired
    private UserRepository user_repository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private TripRepository trip_repository;  // Ensure proper @Autowired for TripRepository

    @Autowired
    private UserTripsRepository userTripsRepository;

    @Autowired
    private PostRepository postRepository;

    // Main method to run the Spring Boot applicatio
    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    // API to join a trip or update the status of an existing user-trip association
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/user-trips")
    public ResponseEntity<?> joinTrip(@RequestBody Map<String, String> payload) {
        System.out.println("Payload received: " + payload);

        try {
            String userEmail = payload.get("userEmail");
            Long tripId = Long.parseLong(payload.get("tripId"));
            String status = payload.get("status");

            System.out.println("Parsed values - userEmail: " + userEmail + ", tripId: " + tripId + ", status: " + status);

            // Validate user
            Optional<User> userOptional = user_repository.findByEmail(userEmail);
            if (userOptional.isEmpty()) {
                System.err.println("Error: User not found for email " + userEmail);
                return ResponseEntity.badRequest().body("User not found.");
            }

            User user = userOptional.get();
            System.out.println("User found: " + user.getUserId());

            // Check if UserTrip already exists
            Optional<UserTrips> existingUserTrip = userTripsRepository.findByUserIdAndTripId(user.getUserId(), tripId);
            if (existingUserTrip.isPresent()) {
                // Update status if already exists
                UserTrips userTrip = existingUserTrip.get();
                userTrip.setStatus(status);
                userTripsRepository.save(userTrip);
                System.out.println("Updated user trip status to: " + status);
            } else {
                // Create a new UserTrip if it doesn't exist
                UserTrips newUserTrip = new UserTrips();
                newUserTrip.setUserId(user.getUserId());
                newUserTrip.setTripId(tripId);
                newUserTrip.setStatus(status);
                userTripsRepository.save(newUserTrip);
                System.out.println("Created new user trip with status: " + status);
            }

            return ResponseEntity.ok("Trip join status updated.");
        } catch (NumberFormatException e) {
            System.err.println("Error parsing trip ID: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid trip ID.");
        } catch (Exception e) {
            System.err.println("Error saving user trip: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred.");
        }
    }

    @CrossOrigin(origins = "http://localhost:3000")
@GetMapping("/backend/user-profile/{userId}")
public ResponseEntity<?> getUserProfile(@PathVariable Long userId) {
    try {
        // Fetch user details
        Optional<User> userOptional = user_repository.findById(userId);
        if (userOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }
        User user = userOptional.get();

        // Fetch trips created by the user
        List<Trip> userTrips = trip_repository.findByCreatedByUserId(userId);

        // Fetch posts by the user
        List<Post> userPosts = postRepository.findByUserTrip_User_UserId(userId);

        // Create a response object
        Map<String, Object> profileData = new HashMap<>();
        profileData.put("user", user);
        profileData.put("trips", userTrips);
        profileData.put("posts", userPosts);

        return ResponseEntity.ok(profileData);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching user profile.");
    }
}
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/user-trips")
    public ResponseEntity<?> getUserTrips(@RequestParam String email) {
        try {
            // Find the user by their email
            Optional<User> userOptional = user_repository.findByEmail(email);
            if (userOptional.isEmpty()) {
                return ResponseEntity.badRequest().body("User not found.");
            }

            User user = userOptional.get();

            // Fetch all UserTrips for the given user
            List<UserTrips> userTripsList = userTripsRepository.findByUserId(user.getUserId());

            // Map UserTrips to include Trip details
            List<Map<String, Object>> tripsWithDetails = new ArrayList<>();
            for (UserTrips userTrip : userTripsList) {
                Optional<Trip> tripOptional = trip_repository.findById(userTrip.getTripId());
                if (tripOptional.isPresent()) {
                    Trip trip = tripOptional.get();
                    Map<String, Object> tripDetails = new HashMap<>();
                    tripDetails.put("userTripId", userTrip.getUserTripId());
                    tripDetails.put("status", userTrip.getStatus());
                    
                    // Include Trip details
                    Map<String, Object> tripInfo = new HashMap<>();
                    tripInfo.put("tripId", trip.getTripId());
                    tripInfo.put("location", trip.getLocation());
                    tripInfo.put("startDate", trip.getStartDate());
                    tripInfo.put("endDate", trip.getEndDate());
                    tripInfo.put("description", trip.getDescription());

                    tripDetails.put("trip", tripInfo); // Add trip details to the response

                    tripsWithDetails.add(tripDetails);
                }
            }

            return ResponseEntity.ok(tripsWithDetails);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred while fetching user trips.");
        }
    }

    // API to get user requests for a specific trip
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/trips/{tripId}/requests")
    public ResponseEntity<List<Map<String, Object>>> getTripRequests(@PathVariable Long tripId) {
        Optional<Trip> tripOptional = trip_repository.findById(tripId);
        if (tripOptional.isEmpty()) {
            return ResponseEntity.badRequest().body(null);
        }

        List<UserTrips> userTrips = userTripsRepository.findByTripId(tripId);
        List<Map<String, Object>> requests = new ArrayList<>();

        for (UserTrips userTrip : userTrips) {
            Map<String, Object> request = new HashMap<>();
            Optional<User> userOptional = user_repository.findById(userTrip.getUserId());
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                request.put("userTripId", userTrip.getUserTripId());
                request.put("username", user.getUsername());
                request.put("status", userTrip.getStatus());
                request.put("userId", userTrip.getUserId());
                requests.add(request);
            }
        }

        return ResponseEntity.ok(requests);
    }

    // API to update the status of a user-trip association
    @PutMapping("/backend/user-trips/update")
    public ResponseEntity<?> updateRequest(@RequestBody Map<String, Object> payload) {
        Long tripId = Long.valueOf((Integer) payload.get("tripId"));
        Long userId = Long.valueOf((Integer) payload.get("userId"));
        String status = (String) payload.get("status");

        Optional<UserTrips> userTripsOptional = userTripsRepository.findByUserIdAndTripId(userId, tripId);
        if (userTripsOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Request not found.");
        }

        UserTrips userTrip = userTripsOptional.get();
        userTrip.setStatus(status);
        userTripsRepository.save(userTrip);
        return ResponseEntity.ok("Request updated successfully.");
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/backend/user-trips/{userTripId}")
    public ResponseEntity<?> updateUserTripStatus(
            @PathVariable Long userTripId,
            @RequestBody Map<String, String> payload) {
        try {
            String status = payload.get("status");

            Optional<UserTrips> userTripOptional = userTripsRepository.findById(userTripId);
            if (userTripOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("UserTrip not found.");
            }

            UserTrips userTrip = userTripOptional.get();
            userTrip.setStatus(status);
            userTripsRepository.save(userTrip);

            return ResponseEntity.ok("Status updated successfully.");
        } catch (Exception e) {
            System.err.println("Error updating UserTrip status: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the UserTrip status.");
        }
    }

    // API to sign-in a user locally 
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/credentials/signin")
    public ResponseEntity<?> handle_credentials_signin(@RequestBody User user) {
        List<User> all_users = user_repository.findAll();
        for (User u : all_users) {
            if (u.getUsername().equals(user.getUsername()) &&
                u.getPassword().equals(user.getPassword())) {
                System.out.println("User authenticated successfully.");
                return ResponseEntity.ok(u);
            }
        }

        System.out.println("Invalid email or password.");
        return ResponseEntity.badRequest().body("Invalid email or password.");
    }

    // API to handle google sign in
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/google/signin")
    public ResponseEntity<User> handle_google_signin(@RequestBody User user) {
        List<User> all_users = user_repository.findAll();

        for (User u : all_users) {
            if (u.getEmail().equals(user.getEmail())) {
                return ResponseEntity.ok(u);
            }
        }

        String email = user.getEmail();
        String username = email.split("@")[0]; // Example: using the part before @ as the username
        user.setUsername(username);
        user.setName(username);
        user.setPassword(""); // Leave password blank for Google auth
        user.setCreatedAt(new Timestamp(System.currentTimeMillis()));
        user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

        return ResponseEntity.ok(user_repository.save(user));
    }

    // API to register a user locally 
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/signup")
    public ResponseEntity<?> handle_signup(@RequestBody User user) {
        Optional<User> existingUserByEmail = user_repository.findByEmail(user.getEmail());
        Optional<User> existingUserByUsername = user_repository.findByUsername(user.getUsername());

        if (existingUserByEmail.isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }

        if (existingUserByUsername.isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
        user.setCreatedAt(currentTimestamp);
        user.setUpdatedAt(currentTimestamp);
        user.setName(user.getUsername());


        return ResponseEntity.ok(user_repository.save(user));
    }

    // API to delete user account
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/forgetme")
    public ResponseEntity<?> handle_forgetme(@RequestBody User user) {
      Optional<User> existingUserByEmail = user_repository.findByEmail(user.getEmail());

      if (!existingUserByEmail.isPresent()) {
        return ResponseEntity.badRequest().body("Email doesn't exist.");
      }

      user_repository.deleteById(existingUserByEmail.get().getUserId());
      return ResponseEntity.ok().build();
    }


    // API to get user data by email
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/user")
    public ResponseEntity<?> get_user_data(@RequestHeader("Email") String email) {
        System.out.println("Request to get user data for email: " + email);
        Optional<User> user = user_repository.findByEmail(email);

        if (user.isPresent()) {
            System.out.println("Found Username: " + user.get().getUsername());
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.badRequest().body("User not found");
        }
    }

    // API to update user data
    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/backend/user")
    public ResponseEntity<?> update_user(@RequestHeader("Email") String email, @RequestBody User updatedUser) {
        System.out.println("Request to update user data for email: " + email);
        
        Optional<User> existingUser = user_repository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            
            // Print current user data
            System.out.println("Current User Data:");
            System.out.println("Name: " + user.getName());
            System.out.println("Phone Number: " + user.getPhoneNumber());
            System.out.println("Nationality: " + user.getNationality());
            System.out.println("Languages: " + user.getLanguages());
            System.out.println("Age: " + user.getAge());
            System.out.println("Sex: " + user.getSex());
            System.out.println("Interests: " + user.getInterests());
            System.out.println("Bio: " + user.getBio());
            
            // Print incoming update data
            System.out.println("Updated User Data:");
            System.out.println("Name: " + updatedUser.getName());
            System.out.println("Phone Number: " + updatedUser.getPhoneNumber());
            System.out.println("Nationality: " + updatedUser.getNationality());
            System.out.println("Languages: " + updatedUser.getLanguages());
            System.out.println("Age: " + updatedUser.getAge());
            System.out.println("Sex: " + updatedUser.getSex());
            System.out.println("Interests: " + updatedUser.getInterests());
            System.out.println("Bio: " + updatedUser.getBio());

            // Update user fields
            user.setName(updatedUser.getName());
            user.setPhoneNumber(updatedUser.getPhoneNumber());
            user.setNationality(updatedUser.getNationality());
            user.setLanguages(updatedUser.getLanguages());
            user.setAge(updatedUser.getAge());
            user.setSex(updatedUser.getSex());
            user.setInterests(updatedUser.getInterests());
            user.setBio(updatedUser.getBio());
            user.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            // Save the updated user
            user_repository.save(user);
            System.out.println("User updated successfully.");
            return ResponseEntity.ok("User updated successfully.");
        } else {
            System.out.println("User not found.");
            return ResponseEntity.badRequest().body("User not found.");
        }
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/users")
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = user_repository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }



    // API to get all the trips
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/trips")
    public ResponseEntity<List<Trip>> getAllTrips() {
        List<Trip> trips = trip_repository.findAll();
        for (Trip trip : trips) {
            trip.setInterests(trip.getInterests()); // Load interests for each trip
        }
        return ResponseEntity.ok(trips);
    }

    // API to update trip details
    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/backend/trips/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @RequestBody Trip updatedTrip) {
        System.out.println("Request to update trip with ID: " + id);

        // Update trip details based on ID
        Optional<Trip> optionalTrip = trip_repository.findById(id);
        if (optionalTrip.isPresent()) {
            Trip existingTrip = optionalTrip.get();

            // Update the fields
            existingTrip.setLocation(updatedTrip.getLocation());
            existingTrip.setStartDate(updatedTrip.getStartDate());
            existingTrip.setEndDate(updatedTrip.getEndDate());
            existingTrip.setDescription(updatedTrip.getDescription());
            if (updatedTrip.getInterests() != null) {
                existingTrip.setInterests(updatedTrip.getInterests());
            }

            // Save the updated trip
            try {
                trip_repository.save(existingTrip);
                System.out.println("Trip updated successfully.");
                return ResponseEntity.ok("Trip updated successfully"); 
            } catch (Exception e) {
                System.err.println("Error saving updated trip: " + e.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not save updated trip data.");
            }
        } else {
            System.out.println("Trip not found with ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found");
        }
    }

    // Retrieve trip details using ID
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/trips/{id}")
    public ResponseEntity<Trip> getTripById(@PathVariable Long id) {
        Optional<Trip> trip = trip_repository.findById(id);
        if (trip.isPresent()) {
            return ResponseEntity.ok(trip.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // API to fetch trips created by a specific user
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/trips/created")
    public ResponseEntity<?> getTripsByCreator(@RequestHeader("Email") String email) {
        System.out.println("Request to get trips created by user with email: " + email);

        Optional<User> user = user_repository.findByEmail(email);
        if (user.isEmpty()) {
            System.err.println("User not found for email: " + email);
            return ResponseEntity.badRequest().body("User not found.");
        }

        // Fetch trips created by the user associated with the provided email
        List<Trip> trips = trip_repository.findByCreatedByUserId(user.get().getUserId());
        if (trips.isEmpty()) {
            System.out.println("No trips found for user ID: " + user.get().getUserId());
            return ResponseEntity.ok(List.of()); // Return empty list
        }

        for (Trip trip : trips) {
            trip.setInterests(trip.getInterests());
        }

        System.out.println("Trips fetched successfully for user ID: " + user.get().getUserId());
        return ResponseEntity.ok(trips);
    }

    // API to delete a trip
    @CrossOrigin(origins = "http://localhost:3000")
    @DeleteMapping("/backend/trips/{tripId}")
    public ResponseEntity<?> deleteTrip(@PathVariable Long tripId, @RequestHeader("Email") String email) {
        System.out.println("Request to delete trip with ID: " + tripId + " by user with email: " + email);

        Optional<User> user = user_repository.findByEmail(email);
        if (user.isEmpty()) {
            System.err.println("User not found for email: " + email);
            return ResponseEntity.badRequest().body("User not found.");
        }

        Optional<Trip> trip = trip_repository.findById(tripId);
        if (trip.isEmpty()) {
            System.err.println("Trip not found with ID: " + tripId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found.");
        }
        // Delete a trip if the requesting user is its creator
        if (trip.get().getCreatedBy().getUserId() != user.get().getUserId()) {
            System.err.println("User is not authorized to delete this trip.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this trip.");
        }
        try {
            trip_repository.delete(trip.get());
            System.out.println("Trip with ID: " + tripId + " deleted successfully.");
            return ResponseEntity.ok("Trip deleted successfully.");
        } catch (Exception e) {
            System.err.println("Error deleting trip with ID: " + tripId + ". Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting trip.");
        }
    }

    // API to fetch all interests
    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/interests")
    public ResponseEntity<List<Interest>> getAllInterests() {
        return ResponseEntity.ok(interestRepository.findAll());
    }

    // API to add a new trip
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/trips")
    @Transactional
    public ResponseEntity<?> addTrip(@RequestBody Trip trip) {
        try {
            // Validate the user creating the trip
            Optional<User> user = user_repository.findByEmail(trip.getCreatedByEmail());

            if (user.isEmpty()) {
                System.err.println("Error: User not found for email: " + trip.getCreatedByEmail());
                return ResponseEntity.badRequest().body("User not found.");
            }

            // Associate the trip with the found user
            trip.setCreatedBy(user.get());

            // Set timestamps
            Timestamp currentTimestamp = new Timestamp(System.currentTimeMillis());
            trip.setCreatedAt(currentTimestamp);
            trip.setUpdatedAt(currentTimestamp);

            // Save the trip
            Trip savedTrip = trip_repository.save(trip);

            // Save trip-interests associations
            if (trip.getInterestIds() != null) {
                for (Integer interestId : trip.getInterestIds()) {
                    trip_repository.addTripInterest(savedTrip.getTripId(), interestId);
                }
            }

            System.out.println("Trip added successfully: " + savedTrip);
            return ResponseEntity.ok(savedTrip);

        } catch (Exception e) {
            System.err.println("Error while adding trip: " + e.getMessage());
            return ResponseEntity.status(500).body("An error occurred while adding the trip.");
        }
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/posts")
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAll());
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/backend/posts")
    public ResponseEntity<?> addPost(
            @RequestParam("caption") String caption,
            @RequestParam("image") MultipartFile image,
            @RequestParam("userTripId") Long userTripId) {
        try {
            // Retrieve the UserTrip associated with the userTripId
            Optional<UserTrips> userTripOptional = userTripsRepository.findById(userTripId);
            if (userTripOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("UserTrip not found for the given ID.");
            }

            UserTrips userTrip = userTripOptional.get();

            // Save the image to disk
            String imagePath = saveImageToDisk(image);

            // Create and save the post
            Post post = new Post();
            post.setCaption(caption);
            post.setImage(imagePath);
            post.setUserTrip(userTrip); // Associate with the correct UserTrip
            post.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            post.setUpdatedAt(new Timestamp(System.currentTimeMillis()));

            Post savedPost = postRepository.save(post);

            return ResponseEntity.ok(savedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding post: " + e.getMessage());
        }
    }



    private String saveImageToDisk(MultipartFile image) {
        // Save the image to the "public/images/posts" directory
        String filePath = "src/main/java/frontend/public/images/posts/" + image.getOriginalFilename(); // Physical path
        try {
            Path path = Paths.get(filePath);
            Files.createDirectories(path.getParent()); // Ensure the directories exist
            Files.write(path, image.getBytes());
        } catch (IOException e) {
            throw new RuntimeException("Error saving image", e);
        }
        // Return the relative path used by the frontend
        return "/images/posts/" + image.getOriginalFilename();
    }        

}
