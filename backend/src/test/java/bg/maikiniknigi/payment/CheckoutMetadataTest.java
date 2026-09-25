package bg.maikiniknigi.payment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import bg.maikiniknigi.common.ApiException;
import bg.maikiniknigi.order.CustomerDetails;
import org.junit.jupiter.api.Test;

class CheckoutMetadataTest {

    private static final CustomerDetails CUSTOMER =
            new CustomerDetails("Ana", "Petrova", "ana@example.com", "ul. Otets Paisiy 18, Plovdiv", "+359 888 123 456");

    @Test
    void survivesRoundTripThroughStripeMetadata() {
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        quantities.put(1L, 2);
        quantities.put(3L, 1);
        CheckoutMetadata original = new CheckoutMetadata("0b7c3f36-1111-4e2b-9d0a-3c1f2a4b5c6d", CUSTOMER, quantities);

        CheckoutMetadata restored = CheckoutMetadata.fromMap(original.toMap());

        assertThat(restored).isEqualTo(original);
        assertThat(original.toMap()).containsEntry("items", "1:2,3:1");
    }

    @Test
    void rejectsMissingFields() {
        Map<String, String> map = new HashMap<>(
                new CheckoutMetadata("id", CUSTOMER, Map.of(1L, 1)).toMap());
        map.remove("email");

        assertThatThrownBy(() -> CheckoutMetadata.fromMap(map))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("email");
    }

    @Test
    void rejectsValuesStripeWouldRefuse() {
        CustomerDetails longAddress = new CustomerDetails("Ana", "Petrova", "ana@example.com", "x".repeat(501), "+359888123456");

        assertThatThrownBy(() -> new CheckoutMetadata("id", longAddress, Map.of(1L, 1)).toMap())
                .isInstanceOf(ApiException.class);
    }
}
