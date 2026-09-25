package bg.maikiniknigi.payment;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.StringJoiner;

import bg.maikiniknigi.common.ApiException;
import bg.maikiniknigi.order.CustomerDetails;
import org.springframework.http.HttpStatus;

/**
 * Everything needed to create a card order, stored in the Stripe Checkout Session's metadata.
 * The order is only created when Stripe reports the payment as completed, so these details
 * have to travel with the payment instead of living in our own storage.
 *
 * <p>Books are encoded as {@code "id:quantity,id:quantity"}. Stripe allows at most 500 characters per value.</p>
 */
public record CheckoutMetadata(String anonymousId, CustomerDetails customer, Map<Long, Integer> quantities) {

    private static final int MAX_VALUE_LENGTH = 500;

    private static final String ANONYMOUS_ID = "anonymousId";
    private static final String FIRST_NAME = "firstName";
    private static final String LAST_NAME = "lastName";
    private static final String EMAIL = "email";
    private static final String ADDRESS = "address";
    private static final String PHONE_NUMBER = "phoneNumber";
    private static final String ITEMS = "items";

    public Map<String, String> toMap() {
        StringJoiner items = new StringJoiner(",");
        quantities.forEach((id, quantity) -> items.add(id + ":" + quantity));

        Map<String, String> map = new HashMap<>();
        map.put(ANONYMOUS_ID, anonymousId);
        map.put(FIRST_NAME, customer.firstName());
        map.put(LAST_NAME, customer.lastName());
        map.put(EMAIL, customer.email());
        map.put(ADDRESS, customer.address());
        map.put(PHONE_NUMBER, customer.phoneNumber());
        map.put(ITEMS, items.toString());

        if (map.values().stream().anyMatch(value -> value.length() > MAX_VALUE_LENGTH)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your basket has too many different books for one card payment");
        }
        return map;
    }

    public static CheckoutMetadata fromMap(Map<String, String> map) {
        CustomerDetails customer = new CustomerDetails(required(map, FIRST_NAME), required(map, LAST_NAME),
                required(map, EMAIL), required(map, ADDRESS), required(map, PHONE_NUMBER));

        Map<Long, Integer> quantities = new LinkedHashMap<>();
        for (String entry : required(map, ITEMS).split(",")) {
            String[] parts = entry.split(":");
            if (parts.length != 2) {
                throw new IllegalArgumentException("Malformed items metadata: " + entry);
            }
            quantities.merge(Long.parseLong(parts[0]), Integer.parseInt(parts[1]), Integer::sum);
        }
        return new CheckoutMetadata(required(map, ANONYMOUS_ID), customer, quantities);
    }

    private static String required(Map<String, String> map, String key) {
        String value = map.get(key);
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Missing checkout metadata: " + key);
        }
        return value;
    }
}
