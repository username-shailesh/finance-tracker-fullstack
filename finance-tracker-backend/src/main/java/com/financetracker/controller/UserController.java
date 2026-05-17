package com.financetracker.controller;

import com.financetracker.entity.User;
import com.financetracker.security.UserPrincipal;
import com.financetracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal principal) {
        User user = userService.getUserById(principal.getId());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserPrincipal principal,
                                          @RequestBody Map<String, String> updates) {
        User user = userService.updateUserProfile(
                principal.getId(),
                updates.get("firstName"),
                updates.get("lastName"),
                updates.get("currency")
        );
        return ResponseEntity.ok(user);
    }

    @PostMapping("/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(@AuthenticationPrincipal UserPrincipal principal,
                                                 @RequestParam("file") MultipartFile file) {
        try {
            if (file.getSize() < 20480) { // 20KB minimum
                Map<String, String> error = new HashMap<>();
                error.put("message", "File is too small. Minimum size is 20KB.");
                return ResponseEntity.status(400).body(error);
            }
            User user = userService.updateProfilePicture(principal.getId(), file);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Could not upload file: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/profile-picture/{filename}")
    public ResponseEntity<Resource> getProfilePicture(@PathVariable String filename) {
        try {
            Path path = Paths.get("uploads/profile-pictures").resolve(filename);
            Resource resource = new UrlResource(path.toUri());
            
            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal UserPrincipal principal,
                                           @RequestBody(required = false) Map<String, String> payload) {
        try {
            if (payload == null || !payload.containsKey("password") || payload.get("password").trim().isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Password is required to delete your account.");
                return ResponseEntity.status(400).body(response);
            }
            
            String password = payload.get("password");
            userService.deleteAccount(principal.getId(), password);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Account deleted successfully");
            return ResponseEntity.ok(response);
        } catch (com.financetracker.exception.ApiException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.status(e.getStatusCode()).body(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete account: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }
}
