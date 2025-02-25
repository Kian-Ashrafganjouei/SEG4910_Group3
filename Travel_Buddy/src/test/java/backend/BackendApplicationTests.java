package backend;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import backend.model.Trip;
import backend.model.User;
import backend.model.UserTrips;
import backend.repository.TripRepository;
import backend.repository.UserRepository;
import backend.repository.UserTripsRepository;

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
        assertEquals("Paris", tripDetails.get("location"));

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

    @Test
    void shouldReturnAllTripsSuccessfully() {
        // Arrange
        Trip trip1 = new Trip();
        trip1.setTripId(1L);
        trip1.setLocation("Paris");
        trip1.setDescription("Trip to Paris");

        Trip trip2 = new Trip();
        trip2.setTripId(2L);
        trip2.setLocation("Tokyo");
        trip2.setDescription("Trip to Tokyo");

        List<Trip> mockTrips = Arrays.asList(trip1, trip2);
        when(trip_repository.findAll()).thenReturn(mockTrips);

        // Act
        ResponseEntity<List<Trip>> response = backendApplication.getAllTrips();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Paris", response.getBody().get(0).getLocation());
        assertEquals("Tokyo", response.getBody().get(1).getLocation());
    }

    @Test
    void shouldReturnEmptyListWhenNoTripsAvailable() {
        // Arrange
        when(trip_repository.findAll()).thenReturn(List.of());

        // Act
        ResponseEntity<List<Trip>> response = backendApplication.getAllTrips();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
    }

    @Test
    void shouldReturnTripByIdSuccessfully() {
        // Arrange
        Trip trip = new Trip();
        trip.setTripId(1L);
        trip.setLocation("Paris");
        trip.setDescription("Trip to Paris");

        when(trip_repository.findById(1L)).thenReturn(Optional.of(trip));

        // Act
        ResponseEntity<Trip> response = backendApplication.getTripById(1L);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertNotNull(response.getBody());
        assertEquals("Paris", response.getBody().getLocation());
    }

    @Test
    void shouldReturnNotFoundWhenTripDoesNotExist() {
        // Arrange
        when(trip_repository.findById(99L)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<Trip> response = backendApplication.getTripById(99L);

        // Assert
        assertEquals(404, response.getStatusCodeValue());
        assertNull(response.getBody());
    }


    @Test
    void shouldDeleteUserAccountIfExists() {
        User mockUser = new User();
        mockUser.setUserId(1L);
        mockUser.setEmail("test@example.com");
        when(user_repository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        ResponseEntity<?> response = backendApplication.handle_forgetme(mockUser);

        assertEquals(200, response.getStatusCodeValue());
        verify(user_repository, times(1)).deleteById(mockUser.getUserId());
    }

    @Test
    void shouldReturnBadRequestForNonExistentEmail() {
        when(user_repository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        User mockUser = new User();
        mockUser.setEmail("nonexistent@example.com");
        ResponseEntity<?> response = backendApplication.handle_forgetme(mockUser);

        assertEquals(400, response.getStatusCodeValue());
        assertEquals("Email doesn't exist.", response.getBody());
    }

    @Test
    void shouldReturnUserDataIfEmailExists() {
        // Arrange
        User mockUser = new User();
        mockUser.setEmail("test@example.com");
        mockUser.setUsername("testuser");

        when(user_repository.findByEmail("test@example.com")).thenReturn(Optional.of(mockUser));

        // Act
        ResponseEntity<?> response = backendApplication.get_user_data("test@example.com");

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockUser, response.getBody());
    }

    @Test
    void shouldReturnBadRequestIfEmailDoesNotExist() {
        // Arrange
        when(user_repository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = backendApplication.get_user_data("nonexistent@example.com");

        // Assert
        assertEquals(400, response.getStatusCodeValue());
        assertEquals("User not found", response.getBody());
    }

    @Test
    void shouldUpdateUserTripStatusIfExists() {
        // Arrange
        Long userTripId = 1L;
        String newStatus = "Confirmed";

        UserTrips mockUserTrip = new UserTrips();
        mockUserTrip.setTripId(userTripId);
        mockUserTrip.setStatus("Pending");

        when(userTripsRepository.findById(userTripId)).thenReturn(Optional.of(mockUserTrip));

        Map<String, String> payload = new HashMap<>();
        payload.put("status", newStatus);

        // Act
        ResponseEntity<?> response = backendApplication.updateUserTripStatus(userTripId, payload);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Status updated successfully.", response.getBody());
        assertEquals(newStatus, mockUserTrip.getStatus());
        verify(userTripsRepository, times(1)).save(mockUserTrip);
    }

    @Test
    void shouldReturnNotFoundIfUserTripDoesNotExist() {
        // Arrange
        Long userTripId = 99L;
        when(userTripsRepository.findById(userTripId)).thenReturn(Optional.empty());

        Map<String, String> payload = new HashMap<>();
        payload.put("status", "Cancelled");

        // Act
        ResponseEntity<?> response = backendApplication.updateUserTripStatus(userTripId, payload);

        // Assert
        assertEquals(404, response.getStatusCodeValue());
        assertEquals("UserTrip not found.", response.getBody());
    }

    @Test
    void shouldHandleExceptionGracefully() {
        // Arrange
        Long userTripId = 1L;
        Map<String, String> payload = new HashMap<>();
        payload.put("status", "Cancelled");

        when(userTripsRepository.findById(userTripId)).thenThrow(new RuntimeException("Database error"));

        // Act
        ResponseEntity<?> response = backendApplication.updateUserTripStatus(userTripId, payload);

        // Assert
        assertEquals(500, response.getStatusCodeValue());
        assertEquals("An error occurred while updating the UserTrip status.", response.getBody());
    }

    @Test
    void shouldReturnBadRequestForExistingUser() {
        User U = new User();
        U.setUsername("user0");
        U.setPassword("pass0");
        U.setEmail("email0@gmail.com");

        when(user_repository.findByEmail(U.getEmail())).thenReturn(Optional.of(U));
        when(user_repository.findByUsername(U.getUsername())).thenReturn(Optional.of(U));

        ResponseEntity<?> res = backendApplication.handle_signup(U);

        assertEquals("Email already exists", res.getBody());
        assertEquals(400, res.getStatusCodeValue());
    }

    @Test
    void shouldReturnSuccessForNonExistingUser() {
        User U = new User();
        U.setUsername("user0");
        U.setPassword("pass0");
        U.setEmail("email0@gmail.com");

        when(user_repository.findByEmail(U.getEmail())).thenReturn(Optional.empty());
        when(user_repository.findByUsername(U.getUsername())).thenReturn(Optional.empty());

        ResponseEntity<?> res = backendApplication.handle_signup(U);

        assertEquals(200, res.getStatusCodeValue());
    }

    @Test
    void shouldReturnAllUsersSuccessfully() {
        // Arrange: Create a list of mock users.
        List<User> mockUsers = new ArrayList<>();
        User user1 = new User();
        user1.setUserId(1L);
        user1.setUsername("user1");
        User user2 = new User();
        user2.setUserId(2L);
        user2.setUsername("user2");
        mockUsers.add(user1);
        mockUsers.add(user2);
        
        when(user_repository.findAll()).thenReturn(mockUsers);

        // Act: Call the getAllUsers endpoint.
        ResponseEntity<List<User>> response = backendApplication.getAllUsers();

        // Assert: Verify that the response is HTTP 200 and contains the mock users.
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockUsers, response.getBody());
    }

    @Test
    void shouldReturnInternalServerErrorForGetAllUsers() {
        // Arrange: Simulate an exception thrown by the repository.
        when(user_repository.findAll()).thenThrow(new RuntimeException("Database error"));

        // Act: Call the getAllUsers endpoint.
        ResponseEntity<List<User>> response = backendApplication.getAllUsers();

        // Assert: Verify that the response is HTTP 500 and the body is null.
        assertEquals(500, response.getStatusCodeValue());
        assertNull(response.getBody());
    }

    @Test
    void shouldSaveImageToDiskSuccessfully() throws Exception {
        // Arrange
        String fileName = "testimage.jpg";
        byte[] content = "dummy image content".getBytes();
        MockMultipartFile mockFile = new MockMultipartFile("image", fileName, "image/jpeg", content);

        // Use reflection to access the private saveImageToDisk method
        Method saveImageMethod = BackendApplication.class.getDeclaredMethod("saveImageToDisk", MultipartFile.class);
        saveImageMethod.setAccessible(true);

        // Act
        String returnedPath = (String) saveImageMethod.invoke(backendApplication, mockFile);

        // Assert: Verify that the returned path is as expected
        assertEquals("/images/posts/" + fileName, returnedPath);

        // Also, verify that the file exists on disk at the expected location
        Path filePath = Paths.get("src/main/java/frontend/public/images/posts/" + fileName);
        assertTrue(Files.exists(filePath));

        // Clean up: delete the created file so tests remain idempotent
        Files.deleteIfExists(filePath);
    }

    @Test
    void shouldThrowRuntimeExceptionWhenImageSaveFails() throws Exception {
        // Arrange: Create a broken MultipartFile that simulates an IOException on getBytes()
        MultipartFile brokenFile = new MultipartFile() {
            @Override
            public String getName() { return "image"; }

            @Override
            public String getOriginalFilename() { return "broken.jpg"; }

            @Override
            public String getContentType() { return "image/jpeg"; }

            @Override
            public boolean isEmpty() { return false; }

            @Override
            public long getSize() { return 0; }

            @Override
            public byte[] getBytes() throws IOException { 
                throw new IOException("Simulated error");
            }

            @Override
            public InputStream getInputStream() throws IOException { 
                throw new IOException("Simulated error");
            }

            @Override
            public void transferTo(File dest) throws IOException, IllegalStateException { }
        };

        // Use reflection to access the private saveImageToDisk method
        Method saveImageMethod = BackendApplication.class.getDeclaredMethod("saveImageToDisk", MultipartFile.class);
        saveImageMethod.setAccessible(true);

        // Act & Assert: Expect the method to throw a RuntimeException (wrapped in InvocationTargetException)
        InvocationTargetException exception = assertThrows(InvocationTargetException.class, () -> {
            saveImageMethod.invoke(backendApplication, brokenFile);
        });
        Throwable cause = exception.getCause();
        assertTrue(cause instanceof RuntimeException);
        assertTrue(cause.getMessage().contains("Error saving image"));
    }
}
