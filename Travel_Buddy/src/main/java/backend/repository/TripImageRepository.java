package backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import backend.model.TripImage;

@Repository
public interface TripImageRepository extends JpaRepository<TripImage, Long> {
    List<TripImage> findByTrip_TripId(Long tripId);
}
