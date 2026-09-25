package bg.maikiniknigi.config;

import com.stripe.Stripe;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;

@Configuration
public class StripeConfig {

    private static final Logger log = LoggerFactory.getLogger(StripeConfig.class);

    private final AppProperties properties;

    public StripeConfig(AppProperties properties) {
        this.properties = properties;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void configureStripe() {
        AppProperties.Stripe stripe = properties.stripe();
        if (stripe.enabled()) {
            Stripe.apiKey = stripe.secretKey();
            if (stripe.apiBase() != null && !stripe.apiBase().isBlank()) {
                Stripe.overrideApiBase(stripe.apiBase());
                log.warn("Stripe API base overridden to {} (testing only)", stripe.apiBase());
            }
            log.info("Stripe card payments enabled (currency: {})", stripe.currency());
        } else {
            log.warn("STRIPE_SECRET_KEY is not set: card payments are disabled, only cash orders will work");
        }
        if (!stripe.webhookEnabled()) {
            log.warn("STRIPE_WEBHOOK_SECRET is not set: Stripe webhooks will be rejected and card orders will not be created");
        }
    }
}
