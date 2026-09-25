package bg.maikiniknigi.item;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;

/**
 * Fields shared by a book in the inventory ({@link Item}) and a line of an order
 * ({@link bg.maikiniknigi.order.OrderItem}).
 *
 * <p>This is a mapped superclass rather than an entity so that order lines are stored
 * in their own table and never show up as books in the inventory.</p>
 */
@MappedSuperclass
public abstract class BaseItem {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int quantity;

    protected BaseItem() {
    }

    protected BaseItem(String name, BigDecimal price, int quantity) {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
