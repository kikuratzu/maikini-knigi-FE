package bg.maikiniknigi.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Comparator;
import java.util.List;

public record OrderResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String address,
        String phoneNumber,
        PaymentType paymentType,
        Instant createdAt,
        BigDecimal deliveryFee,
        BigDecimal total,
        List<Line> items) {

    public record Line(Long itemId, String name, BigDecimal price, int quantity) {
    }

    public static OrderResponse from(Order order) {
        List<Line> lines = order.getItems().stream()
                .sorted(Comparator.comparing(OrderItem::getItemId))
                .map(i -> new Line(i.getItemId(), i.getName(), i.getPrice(), i.getQuantity()))
                .toList();
        return new OrderResponse(order.getId(), order.getFirstName(), order.getLastName(), order.getEmail(),
                order.getAddress(), order.getPhoneNumber(), order.getPaymentType(), order.getCreatedAt(),
                order.getDeliveryFee(), order.getTotal(), lines);
    }
}
