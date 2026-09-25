package bg.maikiniknigi.payment;

import bg.maikiniknigi.cart.CartService;
import bg.maikiniknigi.config.AppProperties;
import bg.maikiniknigi.order.Order;
import bg.maikiniknigi.order.OrderService;
import bg.maikiniknigi.order.PaymentType;
import com.stripe.exception.EventDataObjectDeserializationException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.StripeObject;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Receives Stripe events. When a Checkout Session is paid, the card order is created
 * from the details stored in the session metadata and the shopper's basket is emptied.
 */
@RestController
@RequestMapping("/api/payments")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    private final AppProperties properties;
    private final OrderService orderService;
    private final CartService cartService;

    public StripeWebhookController(AppProperties properties, OrderService orderService, CartService cartService) {
        this.properties = properties;
        this.orderService = orderService;
        this.cartService = cartService;
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody String payload,
            @RequestHeader(name = "Stripe-Signature", required = false) String signature) {
        if (!properties.stripe().webhookEnabled()) {
            log.error("Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured");
            return ResponseEntity.status(503).body("Webhook not configured");
        }
        if (signature == null) {
            log.warn("Stripe webhook rejected: missing Stripe-Signature header");
            return ResponseEntity.badRequest().body("Missing signature");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, signature, properties.stripe().webhookSecret());
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook rejected: invalid signature");
            return ResponseEntity.badRequest().body("Invalid signature");
        } catch (RuntimeException e) {
            log.warn("Stripe webhook rejected: unreadable payload ({})", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid payload");
        }

        log.info("Stripe event {} received: {}", event.getId(), event.getType());
        switch (event.getType()) {
            case "checkout.session.completed", "checkout.session.async_payment_succeeded" -> handlePaidSession(event);
            default -> log.debug("Ignoring Stripe event type {}", event.getType());
        }
        return ResponseEntity.ok("ok");
    }

    private void handlePaidSession(Event event) {
        Session session = readSession(event);
        if (session == null) {
            return;
        }
        if (!"paid".equals(session.getPaymentStatus())) {
            log.info("Checkout session {} completed but payment status is '{}'; waiting for payment",
                    session.getId(), session.getPaymentStatus());
            return;
        }
        if (orderService.existsForStripeSession(session.getId())) {
            log.info("Order for checkout session {} already exists; ignoring repeated event", session.getId());
            return;
        }

        CheckoutMetadata metadata;
        try {
            metadata = CheckoutMetadata.fromMap(session.getMetadata());
        } catch (IllegalArgumentException e) {
            log.error("PAID SESSION WITHOUT VALID METADATA: checkout session {} could not be turned into an order: {}",
                    session.getId(), e.getMessage());
            return;
        }

        try {
            Order order = orderService.placeOrder(metadata.customer(), PaymentType.CARD, metadata.quantities(),
                    session.getId(), true);
            cartService.clear(metadata.anonymousId());
            log.info("Card order {} created from checkout session {}", order.getId(), session.getId());
        } catch (DataIntegrityViolationException e) {
            // Two deliveries of the same event raced each other; the other one created the order
            log.info("Order for checkout session {} was created concurrently; ignoring", session.getId());
        }
    }

    private Session readSession(Event event) {
        EventDataObjectDeserializer deserializer = event.getDataObjectDeserializer();
        StripeObject object = deserializer.getObject().orElse(null);
        if (object == null) {
            // The event was sent with a different API version than this library expects
            try {
                object = deserializer.deserializeUnsafe();
            } catch (EventDataObjectDeserializationException e) {
                log.error("Could not read checkout session from Stripe event {}: {}", event.getId(), e.getMessage());
                return null;
            }
        }
        if (!(object instanceof Session session)) {
            log.error("Stripe event {} did not contain a checkout session", event.getId());
            return null;
        }
        return session;
    }
}
