package bg.maikiniknigi.item;

import java.math.BigDecimal;

public record ItemDto(Long id, String name, BigDecimal price, int quantity) {

    public static ItemDto from(Item item) {
        return new ItemDto(item.getId(), item.getName(), item.getPrice(), item.getQuantity());
    }
}
