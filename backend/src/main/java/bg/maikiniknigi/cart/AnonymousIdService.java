package bg.maikiniknigi.cart;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

import bg.maikiniknigi.config.AppProperties;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

/**
 * Identifies anonymous shoppers with a random id kept in a cookie that lasts 7 days.
 */
@Service
public class AnonymousIdService {

    private static final Logger log = LoggerFactory.getLogger(AnonymousIdService.class);

    private final AppProperties.AnonymousCookie cookie;

    public AnonymousIdService(AppProperties properties) {
        this.cookie = properties.anonymousCookie();
    }

    /** The shopper's id from the cookie, if they have a valid one. */
    public Optional<String> find(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(c -> cookie.name().equals(c.getName()))
                .map(Cookie::getValue)
                .filter(AnonymousIdService::isValidId)
                .findFirst();
    }

    /**
     * Returns the shopper's existing id, or creates a new one and sends it back in a cookie.
     * An existing id is reused as is, so its cookie keeps its original expiry.
     */
    public String findOrCreate(HttpServletRequest request, HttpServletResponse response) {
        Optional<String> existing = find(request);
        if (existing.isPresent()) {
            return existing.get();
        }
        String id = UUID.randomUUID().toString();
        ResponseCookie responseCookie = ResponseCookie.from(cookie.name(), id)
                .httpOnly(true)
                .secure(cookie.secure())
                .sameSite(cookie.sameSite())
                .path("/")
                .maxAge(cookie.maxAge())
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());
        log.info("Issued new anonymous id {} (valid for {} days)", id, cookie.maxAge().toDays());
        return id;
    }

    private static boolean isValidId(String value) {
        try {
            return UUID.fromString(value).toString().equals(value);
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
