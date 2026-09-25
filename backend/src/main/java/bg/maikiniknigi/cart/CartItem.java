package bg.maikiniknigi.cart;

import java.math.BigDecimal;

/**
 * A future order item, stored as JSON in the anonymous user's Redis cart hash.
 * {@code quantity} is the number of copies in the basket.
 */
public record CartItem(Long itemId, String name, BigDecimal price, int quantity) {

    public BigDecimal lineTotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }

    public CartItem withQuantity(int newQuantity) {
        return new CartItem(itemId, name, price, newQuantity);
    }
}
