package bg.maikiniknigi.cart;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * @param quantity the new number of copies; 0 removes the book from the basket
 */
public record UpdateCartItemRequest(
        @NotNull(message = "quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        @Max(value = 99, message = "Quantity must be at most 99")
        Integer quantity) {
}
