package com.voicebuilder.resume.controller;

import com.voicebuilder.resume.entity.User;
import com.voicebuilder.resume.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        User savedUser = userService.saveUser(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe(org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody java.util.Map<String, String> body, org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");
        
        user.setName(body.get("name"));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userService.saveUser(user);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody java.util.Map<String, String> body, org.springframework.security.core.Authentication authentication) {
        String email = authentication.getName();
        User user = userService.getUserByEmail(email).orElse(null);
        if (user == null) return ResponseEntity.status(404).body("User not found");

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(401).body("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userService.saveUser(user);
        
        return ResponseEntity.ok("Password updated successfully");
    }
}
