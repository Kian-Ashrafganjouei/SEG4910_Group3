package backend;

import java.sql.Timestamp;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import backend.model.Interest;
import backend.model.Trip;
import backend.model.User;
import backend.repository.InterestRepository;
import backend.repository.TripRepository;
import backend.repository.UserRepository;
import jakarta.transaction.Transactional;

@RestController
@SpringBootApplication
public class BackendApplication {

    @Autowired
    private UserRepository user_repository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private TripRepository trip_repository;  // Ensure proper @Autowired for TripRepository

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

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
    @GetMapping("/backend/trips")
    public ResponseEntity<List<Trip>> getAllTrips() {
        List<Trip> trips = trip_repository.findAll();
        for (Trip trip : trips) {
            trip.setInterests(trip.getInterests()); // Load interests for each trip
        }
        return ResponseEntity.ok(trips);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PutMapping("/backend/trips/{id}")
    public ResponseEntity<?> updateTrip(@PathVariable Long id, @RequestBody Trip updatedTrip) {
        System.out.println("Request to update trip with ID: " + id);

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


    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/backend/interests")
    public ResponseEntity<List<Interest>> getAllInterests() {
        return ResponseEntity.ok(interestRepository.findAll());
    }

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

}
