package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
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
}
