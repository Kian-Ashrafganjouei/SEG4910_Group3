package backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import backend.model.UserTrips;

@Repository
public interface UserTripsRepository extends JpaRepository<UserTrips, Long> {

    @Query("SELECT ut FROM UserTrips ut WHERE ut.user.userId = :userId AND ut.trip.tripId = :tripId")
    Optional<UserTrips> findByUserIdAndTripId(Long userId, Long tripId);

    @Query("SELECT ut FROM UserTrips ut WHERE ut.user.userId = :userId")
    List<UserTrips> findByUserId(Long userId);

    @Query("SELECT ut FROM UserTrips ut WHERE ut.trip.tripId = :tripId")
    List<UserTrips> findByTripId(Long tripId);

}
