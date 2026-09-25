package bg.maikiniknigi.payment;

import java.math.BigDecimal;
import java.util.List;

import bg.maikiniknigi.cart.CartItem;
import bg.maikiniknigi.common.ApiException;
import bg.maikiniknigi.common.InsufficientStockException;
import bg.maikiniknigi.config.AppProperties;
import bg.maikiniknigi.item.Item;
import bg.maikiniknigi.item.ItemService;
import bg.maikiniknigi.order.DeliveryPolicy;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

/**
 * Starts card payments with Stripe Checkout. The order itself is created later,
 * when Stripe tells us (via the webhook) that the payment is completed.
 */
@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final AppProperties properties;
    private final ItemService itemService;
    private final DeliveryPolicy deliveryPolicy;

    public PaymentService(AppProperties properties, ItemService itemService, DeliveryPolicy deliveryPolicy) {
        this.properties = properties;
        this.itemService = itemService;
        this.deliveryPolicy = deliveryPolicy;
    }

    public record CheckoutSession(String url, BigDecimal total) {
    }

    /**
     * Creates a Stripe Checkout Session for the basket, priced from the database (not from the basket),
     * after checking every book is still in stock.
     */
    public CheckoutSession createCheckoutSession(CheckoutMetadata metadata, List<CartItem> cart) {
        AppProperties.Stripe stripe = properties.stripe();
        if (!stripe.enabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Card payments are not available right now. Please choose cash.");
        }

        String frontendUrl = properties.frontendUrl().replaceAll("/+$", "");
        SessionCreateParams.Builder params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(frontendUrl + "/?payment=success&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(frontendUrl + "/?payment=cancelled")
                .setCustomerEmail(metadata.customer().email())
                .putAllMetadata(metadata.toMap());

        BigDecimal subtotal = BigDecimal.ZERO;
        for (CartItem line : cart) {
            Item book = itemService.getItem(line.itemId());
            if (line.quantity() > book.getQuantity()) {
                throw InsufficientStockException.forBook(book.getName(), book.getQuantity());
            }
            params.addLineItem(lineItem(book.getName(), book.getPrice(), line.quantity(), stripe.currency()));
            subtotal = subtotal.add(book.getPrice().multiply(BigDecimal.valueOf(line.quantity())));
        }

        BigDecimal deliveryFee = deliveryPolicy.feeFor(subtotal);
        if (deliveryFee.signum() > 0) {
            params.addLineItem(lineItem("Delivery", deliveryFee, 1, stripe.currency()));
        }

        try {
            Session session = Session.create(params.build());
            log.info("Stripe checkout session {} created for cart {} (total {})", session.getId(),
                    metadata.anonymousId(), subtotal.add(deliveryFee));
            return new CheckoutSession(session.getUrl(), subtotal.add(deliveryFee));
        } catch (StripeException e) {
            log.error("Could not create Stripe checkout session for cart {}: {}", metadata.anonymousId(), e.getMessage());
            throw new ApiException(HttpStatus.BAD_GATEWAY, "The card payment could not be started. Please try again.");
        }
    }

    private static SessionCreateParams.LineItem lineItem(String name, BigDecimal price, int quantity, String currency) {
        return SessionCreateParams.LineItem.builder()
                .setQuantity((long) quantity)
                .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                        .setCurrency(currency)
                        // Stripe expects the amount in cents
                        .setUnitAmount(price.movePointRight(2).longValueExact())
                        .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                .setName(name)
                                .build())
                        .build())
                .build();
    }
}
