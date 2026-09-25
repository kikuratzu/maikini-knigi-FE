package bg.maikiniknigi.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * @param quantity copies to add; defaults to 1 when omitted
 */
public record AddToCartRequest(
        @NotNull(message = "itemId is required") Long itemId,
        @Min(value = 1, message = "Quantity must be at least 1")
        @Max(value = 99, message = "Quantity must be at most 99")
        Integer quantity) {

    public int quantityOrDefault() {
        return quantity == null ? 1 : quantity;
    }
}
