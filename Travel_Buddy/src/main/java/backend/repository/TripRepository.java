package backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.model.Trip;

public interface TripRepository extends JpaRepository<Trip, Long> {}
