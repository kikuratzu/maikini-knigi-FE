package bg.maikiniknigi.order;

import java.math.BigDecimal;

/**
 * Result of {@code POST /api/orders}.
 * Cash orders are created straight away and carry {@code orderId};
 * card orders carry {@code checkoutUrl}, the Stripe page the customer must be sent to.
 */
public record CheckoutResponse(PaymentType paymentType, Long orderId, BigDecimal total, String checkoutUrl) {

    public static CheckoutResponse cash(Order order) {
        return new CheckoutResponse(PaymentType.CASH, order.getId(), order.getTotal(), null);
    }

    public static CheckoutResponse card(String checkoutUrl, BigDecimal total) {
        return new CheckoutResponse(PaymentType.CARD, null, total, checkoutUrl);
    }
}
