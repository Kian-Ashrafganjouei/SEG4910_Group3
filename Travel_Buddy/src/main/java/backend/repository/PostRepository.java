package backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import backend.model.Post;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @Query("SELECT p FROM Post p WHERE p.userTrip.user.userId = :userId")
    List<Post> findPostsByUserId(Long userId);

    @Query("SELECT p FROM Post p JOIN p.userTrip ut JOIN ut.user u WHERE u.email = :email")
    List<Post> findPostsByUserEmail(@Param("email") String email);

    @Query("SELECT p FROM Post p WHERE p.userTrip.user.userId = :userId")
    List<Post> findByUserTrip_User_UserId(@Param("userId") Long userId);

}

