package backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import backend.UserRepository;
import backend.User;
import java.util.List;
import java.util.Optional;

@RestController
@SpringBootApplication
public class BackendApplication {

  @Autowired
  UserRepository user_repository; 

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

  @CrossOrigin(origins = "http://localhost:3000")
  @PostMapping("/backend/signin")
  public ResponseEntity<?> authenticate_user(@RequestBody User user) {
    List<User> all_users = user_repository.findAll();

    for (User u : all_users) {
      if (u.getUsername().equals(user.getUsername()) &&
          u.getPassword().equals(user.getPassword()))
      {
        return ResponseEntity.ok(u);
      }
    }
    return ResponseEntity.badRequest().body("Invalid username or password.");
  }

  @CrossOrigin(origins = "http://localhost:3000")
  @PostMapping("/backend/signup")
  public ResponseEntity<?> register_user(@RequestBody User user) {
    Optional<User> existingUserByUsername = user_repository.findByUsername(user.getUsername());
    Optional<User> existingUserByEmail = user_repository.findByEmail(user.getEmail());

    if (existingUserByUsername.isPresent() ||
        existingUserByEmail.isPresent())
    {
      return ResponseEntity.badRequest().body("Username or Email already exist");
    }

    return ResponseEntity.ok(user_repository.save(user));
  }
}
