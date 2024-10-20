package backend;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  public long id;

  // TODO: encode uniqueness here.
  @Column(name = "username")
  public String username;

  @Column(name = "password")
  public String password;

  @Column(name = "email")
  public String email;

  public String getUsername() {
    return username;
  }

  public String getPassword() {
    return password;
  }

  public String getEmail() {
    return email;
  }
}
