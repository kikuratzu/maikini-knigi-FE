package bg.maikiniknigi.cart;

import java.math.BigDecimal;
import java.util.List;

/**
 * @param freeDeliveryFrom subtotal from which delivery is free
 */
public record CartResponse(List<Line> items, int totalQuantity, BigDecimal subtotal, BigDecimal deliveryFee,
        BigDecimal total, BigDecimal freeDeliveryFrom) {

    public record Line(Long itemId, String name, BigDecimal price, int quantity, BigDecimal lineTotal) {

        static Line from(CartItem item) {
            return new Line(item.itemId(), item.name(), item.price(), item.quantity(), item.lineTotal());
        }
    }
}
