package com.bencao;

import com.bencao.dto.UserProfileVO;
import com.bencao.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class ProfileApiTest {

    @Autowired
    private AuthService authService;

    @Test
    void getCurrentProfile() {
        UserProfileVO profile = authService.getCurrentProfile(1L);
        assertNotNull(profile);
        System.out.println("profile=" + profile);
    }
}
