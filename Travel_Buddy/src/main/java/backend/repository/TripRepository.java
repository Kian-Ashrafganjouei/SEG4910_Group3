package backend.repository;

import backend.model.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.repository.query.Param;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO trip_interests (trip_id, interest_id) VALUES (:tripId, :interestId)", nativeQuery = true)
    void addTripInterest(@Param("tripId") Long tripId, @Param("interestId") Integer interestId);
}

