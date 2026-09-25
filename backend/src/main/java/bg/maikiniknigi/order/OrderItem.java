package bg.maikiniknigi.order;

import java.math.BigDecimal;

import bg.maikiniknigi.item.BaseItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * One line of an order. It copies the book's name and price at the time of purchase,
 * so later price changes do not alter past orders. {@code quantity} is the number of copies bought.
 */
@Entity
@Table(name = "order_items")
public class OrderItem extends BaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Id of the book in the {@code items} table. */
    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    protected OrderItem() {
    }

    public OrderItem(Long itemId, String name, BigDecimal price, int quantity) {
        super(name, price, quantity);
        this.itemId = itemId;
    }

    public BigDecimal getLineTotal() {
        return getPrice().multiply(BigDecimal.valueOf(getQuantity()));
    }

    public Long getId() {
        return id;
    }

    public Long getItemId() {
        return itemId;
    }

    public Order getOrder() {
        return order;
    }

    void setOrder(Order order) {
        this.order = order;
    }

    // Identity is the database id; unsaved lines are only equal to themselves.
    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof OrderItem other)) {
            return false;
        }
        return id != null && id.equals(other.id);
    }

    @Override
    public int hashCode() {
        return OrderItem.class.hashCode();
    }
}
