package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.beans.factory.annotation.Autowired;
import backend.UserRepository;
import backend.User;
import java.util.List;
import java.util.Optional;
import java.sql.Timestamp;

@RestController
@SpringBootApplication
public class BackendApplication {

    @Autowired
    UserRepository user_repository; 

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


}
