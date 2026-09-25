package bg.maikiniknigi.order;

import java.util.List;

import bg.maikiniknigi.cart.AnonymousIdService;
import bg.maikiniknigi.cart.CartItem;
import bg.maikiniknigi.cart.CartService;
import bg.maikiniknigi.common.ApiException;
import bg.maikiniknigi.payment.CheckoutMetadata;
import bg.maikiniknigi.payment.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final AnonymousIdService anonymousIdService;
    private final CartService cartService;
    private final OrderService orderService;
    private final PaymentService paymentService;

    public OrderController(AnonymousIdService anonymousIdService, CartService cartService, OrderService orderService,
            PaymentService paymentService) {
        this.anonymousIdService = anonymousIdService;
        this.cartService = cartService;
        this.orderService = orderService;
        this.paymentService = paymentService;
    }

    /**
     * Checks out the shopper's basket.
     * <ul>
     *   <li>CASH: the order is created now (201) and the basket is emptied.</li>
     *   <li>CARD: a Stripe payment is started (200) and the response contains the Stripe checkout URL.
     *       The order is created by the webhook once the payment is completed.</li>
     * </ul>
     */
    @PostMapping
    public ResponseEntity<CheckoutResponse> createOrder(@Valid @RequestBody CreateOrderRequest body,
            HttpServletRequest request) {
        String anonymousId = anonymousIdService.find(request)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Your basket is empty"));
        List<CartItem> cart = cartService.getItems(anonymousId);
        if (cart.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your basket is empty");
        }
        log.info("Checkout started for cart {} with {} payment", anonymousId, body.paymentType());

        if (body.paymentType() == PaymentType.CASH) {
            Order order = orderService.placeOrder(body.customer(), PaymentType.CASH,
                    cartService.getQuantities(anonymousId), null, false);
            cartService.clear(anonymousId);
            return ResponseEntity.status(HttpStatus.CREATED).body(CheckoutResponse.cash(order));
        }

        CheckoutMetadata metadata = new CheckoutMetadata(anonymousId, body.customer(),
                cartService.getQuantities(anonymousId));
        PaymentService.CheckoutSession session = paymentService.createCheckoutSession(metadata, cart);
        return ResponseEntity.ok(CheckoutResponse.card(session.url(), session.total()));
    }
}
