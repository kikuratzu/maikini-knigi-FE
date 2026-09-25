package bg.maikiniknigi.order;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;

import bg.maikiniknigi.config.AppProperties;
import org.junit.jupiter.api.Test;

class DeliveryPolicyTest {

    private final DeliveryPolicy policy = new DeliveryPolicy(new AppProperties(null, null, null, null,
            new AppProperties.Delivery(new BigDecimal("3.99"), new BigDecimal("40.00")), null, null));

    @Test
    void chargesFeeBelowThreshold() {
        assertThat(policy.feeFor(new BigDecimal("39.99"))).isEqualByComparingTo("3.99");
    }

    @Test
    void freeFromThreshold() {
        assertThat(policy.feeFor(new BigDecimal("40.00"))).isEqualByComparingTo("0");
        assertThat(policy.feeFor(new BigDecimal("54.70"))).isEqualByComparingTo("0");
    }

    @Test
    void noFeeForEmptyBasket() {
        assertThat(policy.feeFor(BigDecimal.ZERO)).isEqualByComparingTo("0");
    }
}
