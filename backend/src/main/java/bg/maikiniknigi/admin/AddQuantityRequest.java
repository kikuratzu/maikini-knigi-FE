package bg.maikiniknigi.admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * @param amount copies to add to the stock
 */
public record AddQuantityRequest(
        @NotNull(message = "amount is required")
        @Min(value = 1, message = "Amount must be at least 1")
        @Max(value = 10000, message = "Amount must be at most 10000")
        Integer amount) {
}
