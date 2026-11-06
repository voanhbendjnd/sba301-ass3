package vn.edu.fpt.a3voanhben_se1910.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Author: Vo Anh Ben - CE190709
 * Cấu hình bảo mật hệ thống REST Service (Spring Security 6 + JWT)
 * Phân quyền chặt chẽ theo đặc tả Assignment 03:
 * - Public: Xem thông tin phòng (/api/rooms/public/**), Loại phòng xem công khai, Đăng nhập, Đăng ký
 * - Staff: Quản lý khách hàng, Quản lý phòng (CRUD), Quản lý đặt phòng
 * - Customer: Đặt phòng trực tuyến, Xem lịch sử đặt phòng, Quản lý hồ sơ
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Autowired
    private CustomAccessDeniedHandler accessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(unauthorizedHandler)
                        .accessDeniedHandler(accessDeniedHandler)
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // 1. Công khai không cần xác thực
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/rooms/public/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/room-types/**").permitAll()
                        .requestMatchers("/error").permitAll()

                        // 2. Chức năng của Customer (và Staff cũng có thể truy cập nếu cần)
                        .requestMatchers(HttpMethod.PUT, "/api/customers/*/profile").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/customers/*").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/bookings").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/history").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/bookings/*").hasAnyRole("CUSTOMER", "STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/rooms/*").hasAnyRole("CUSTOMER", "STAFF")

                        // 3. Chức năng riêng của Staff (Nhân viên)
                        .requestMatchers("/api/customers/**").hasRole("STAFF")
                        .requestMatchers("/api/rooms/**").hasRole("STAFF")
                        .requestMatchers("/api/room-types/**").hasRole("STAFF")
                        .requestMatchers("/api/bookings/**").hasRole("STAFF")

                        // 4. Mọi request khác đều yêu cầu xác thực JWT
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With",
                "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
