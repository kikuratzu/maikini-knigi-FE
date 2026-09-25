package bg.maikiniknigi.order;

import java.math.BigDecimal;

import bg.maikiniknigi.config.AppProperties;
import org.springframework.stereotype.Component;

/**
 * Delivery costs a flat fee, and is free once the subtotal reaches the free-delivery threshold.
 */
@Component
public class DeliveryPolicy {

    private final AppProperties.Delivery delivery;

    public DeliveryPolicy(AppProperties properties) {
        this.delivery = properties.delivery();
    }

    public BigDecimal freeFrom() {
        return delivery.freeFrom();
    }

    public BigDecimal feeFor(BigDecimal subtotal) {
        if (subtotal.signum() == 0 || subtotal.compareTo(delivery.freeFrom()) >= 0) {
            return BigDecimal.ZERO.setScale(2);
        }
        return delivery.fee();
    }
}
