package bg.maikiniknigi.config;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application settings bound from the {@code app.*} keys in application.yml.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String frontendUrl,
        Cors cors,
        Cart cart,
        AnonymousCookie anonymousCookie,
        Delivery delivery,
        Admin admin,
        Stripe stripe) {

    public record Cors(List<String> allowedOrigins) {
    }

    public record Cart(Duration ttl) {
    }

    public record AnonymousCookie(String name, Duration maxAge, boolean secure, String sameSite) {
    }

    public record Delivery(BigDecimal fee, BigDecimal freeFrom) {
    }

    public record Admin(String username, String password) {
    }

    /**
     * @param apiBase optional override of the Stripe API URL, e.g. for stripe-mock in tests; empty = real Stripe
     */
    public record Stripe(String secretKey, String webhookSecret, String currency, String apiBase) {

        public boolean enabled() {
            return secretKey != null && !secretKey.isBlank();
        }

        public boolean webhookEnabled() {
            return webhookSecret != null && !webhookSecret.isBlank();
        }
    }
}
