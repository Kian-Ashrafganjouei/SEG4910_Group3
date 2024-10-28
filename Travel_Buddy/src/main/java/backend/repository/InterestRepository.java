package backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import backend.model.Interest;

public interface InterestRepository extends JpaRepository<Interest, Integer> {
}
