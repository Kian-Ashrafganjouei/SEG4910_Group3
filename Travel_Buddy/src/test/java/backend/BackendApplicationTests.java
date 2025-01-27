package backend;

import backend.model.User;
import backend.model.UserTrips;
import backend.model.Trip;
import backend.repository.UserRepository;
import backend.repository.UserTripsRepository;
import backend.repository.TripRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class BackendApplicationTests {
    @Mock
    private UserRepository user_repository;

    @Mock
    private UserTripsRepository userTripsRepository;

    @Mock
    private TripRepository trip_repository;

    @InjectMocks
    private BackendApplication backendApplication;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldAuthenticateUserSuccessfully() {
        // Arrange
        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setPassword("password123");

        when(user_repository.findAll()).thenReturn(List.of(mockUser));

        // Act
        User inputUser = new User();
        inputUser.setUsername("testuser");
        inputUser.setPassword("password123");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockUser, response.getBody());
    }

    @Test
    void shouldReturnBadRequestForIncorrectPassword() {
        // Arrange
        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setPassword("password123");

        when(user_repository.findAll()).thenReturn(List.of(mockUser));

        // Act
        User inputUser = new User();
        inputUser.setUsername("testuser");
        inputUser.setPassword("wrongpassword");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid email or password.", response.getBody());
    }

    @Test
    void shouldReturnBadRequestForNonExistentUser() {
        // Arrange
        when(user_repository.findAll()).thenReturn(List.of());

        // Act
        User inputUser = new User();
        inputUser.setUsername("nonexistent");
        inputUser.setPassword("password");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid email or password.", response.getBody());
    }

    @Test
    void shouldReturnBadRequestForEmptyUsernameAndPassword() {
        // Arrange
        when(user_repository.findAll()).thenReturn(List.of());

        // Act
        User inputUser = new User();
        inputUser.setUsername("");
        inputUser.setPassword("");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid email or password.", response.getBody());
    }

    @Test
    void shouldReturnBadRequestForNullUsername() {
        // Arrange
        when(user_repository.findAll()).thenReturn(List.of());

        // Act
        User inputUser = new User();
        inputUser.setUsername(null);
        inputUser.setPassword("password123");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid email or password.", response.getBody());
    }

    @Test
    void shouldReturnBadRequestForNullPassword() {
        // Arrange
        User mockUser = new User();
        mockUser.setUsername("testuser");
        mockUser.setPassword("password123");

        when(user_repository.findAll()).thenReturn(List.of(mockUser));

        // Act
        User inputUser = new User();
        inputUser.setUsername("testuser");
        inputUser.setPassword(null);

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid email or password.", response.getBody());
    }

    @Test
    void shouldHandleMultipleUsersAndAuthenticateCorrectOne() {
        // Arrange
        User user1 = new User();
        user1.setUsername("user1");
        user1.setPassword("pass1");

        User user2 = new User();
        user2.setUsername("user2");
        user2.setPassword("pass2");

        when(user_repository.findAll()).thenReturn(List.of(user1, user2));

        // Act
        User inputUser = new User();
        inputUser.setUsername("user2");
        inputUser.setPassword("pass2");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("user2", ((User) response.getBody()).getUsername());
    }

    @Test
    void shouldReturnBadRequestForCaseSensitiveUsernameMismatch() {
        // Arrange
        User mockUser = new User();
        mockUser.setUsername("TestUser");
        mockUser.setPassword("password123");

        when(user_repository.findAll()).thenReturn(List.of(mockUser));

        // Act
        User inputUser = new User();
        inputUser.setUsername("testuser"); // Different case
        inputUser.setPassword("password123");

        ResponseEntity<?> response = backendApplication.handle_credentials_signin(inputUser);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Invalid email or password.", response.getBody());
    }

     @Test
    void shouldReturnBadRequestWhenUserNotFound() {
        // Arrange
        String email = "nonexistentuser@example.com";
        when(user_repository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = backendApplication.getUserTrips(email);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User not found.", response.getBody());
    }

    @Test
    void shouldReturnEmptyListWhenUserHasNoTrips() {
        // Arrange
        String email = "user@example.com";
        User mockUser = new User();
        mockUser.setUserId(1L);
        when(user_repository.findByEmail(email)).thenReturn(Optional.of(mockUser));
        when(userTripsRepository.findByUserId(mockUser.getUserId())).thenReturn(Collections.emptyList());

        // Act
        ResponseEntity<?> response = backendApplication.getUserTrips(email);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertTrue(((List<?>) response.getBody()).isEmpty());
    }
    
    @Test
    void shouldReturnTripsWithDetailsWhenUserHasTrips() {
        // Arrange
        String email = "user@example.com";
        User mockUser = new User();
        mockUser.setUserId(1L);
        when(user_repository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        UserTrips mockUserTrip = new UserTrips();
        mockUserTrip.setUserId(1L);
        mockUserTrip.setTripId(101L);
        mockUserTrip.setStatus("Booked");

        List<UserTrips> mockUserTripsList = Collections.singletonList(mockUserTrip);
        when(userTripsRepository.findByUserId(mockUser.getUserId())).thenReturn(mockUserTripsList);

        Trip mockTrip = new Trip();
        mockTrip.setTripId(101L);
        mockTrip.setLocation("Paris");
     
        mockTrip.setDescription("Trip to Paris");

        when(trip_repository.findById(mockUserTrip.getTripId())).thenReturn(Optional.of(mockTrip));

        // Act
        ResponseEntity<?> response = backendApplication.getUserTrips(email);

        // Assert
        assertEquals(200, response.getStatusCodeValue());

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trips = (List<Map<String, Object>>) response.getBody();
        assertEquals(1, trips.size());

        // Access nested trip details correctly
        Map<String, Object> tripDetails = (Map<String, Object>) trips.get(0).get("trip");
        assertEquals("Paris", tripDetails.get("locationn"));

        assertEquals("Booked", trips.get(0).get("status"));
    }

    @Test
    void shouldReturnBadRequestWhenTripNotFoundForUser() {
        // Arrange
        String email = "user@example.com";
        User mockUser = new User();
        mockUser.setUserId(1L);
        when(user_repository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        UserTrips mockUserTrip = new UserTrips();
        mockUserTrip.setUserId(1L);
        mockUserTrip.setTripId(101L);
        mockUserTrip.setStatus("Booked");

        List<UserTrips> mockUserTripsList = Collections.singletonList(mockUserTrip);
        when(userTripsRepository.findByUserId(mockUser.getUserId())).thenReturn(mockUserTripsList);
        when(trip_repository.findById(mockUserTrip.getTripId())).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = backendApplication.getUserTrips(email);

        // Assert
        assertEquals(200, response.getStatusCodeValue());

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trips = (List<Map<String, Object>>) response.getBody();
        assertTrue(trips.isEmpty());
    }
}
