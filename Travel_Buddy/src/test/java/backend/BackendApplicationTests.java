package backend;

import backend.model.User;
import backend.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BackendApplicationTests {

    @Mock
    private UserRepository user_repository;

    @InjectMocks
    private BackendApplication backendApplication; // Test the controller directly

    @Test
    void shouldAuthenticateUserSuccessfully() {
        // Arrange
        MockitoAnnotations.openMocks(this);

        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setPassword("password123");

        when(user_repository.findAll()).thenReturn(List.of(mockUser));

        // Act
        User inputUser = new User();
        inputUser.setUsername("testuser");
        inputUser.setPassword("password1234");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(200, response.getStatusCodeValue()); // HTTP 200 OK
        User authenticatedUser = (User) response.getBody();
        assertEquals("testuser", authenticatedUser.getUsername());

    }
}
