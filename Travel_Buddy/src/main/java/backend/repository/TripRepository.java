package backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import backend.model.Trip;
import java.util.Optional;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO trip_interests (trip_id, interest_id) VALUES (:tripId, :interestId)", nativeQuery = true)
    void addTripInterest(@Param("tripId") Long tripId, @Param("interestId") Integer interestId);

    @Query("SELECT t FROM Trip t WHERE t.createdBy.userId = :userId")
    List<Trip> findByCreatedByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Trip t WHERE t.tripId = :tripId")
    Optional<Trip> findTripById(@Param("tripId") Long tripId);  
}

