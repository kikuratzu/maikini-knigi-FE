package bg.maikiniknigi.item;

import java.math.BigDecimal;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * A book in the shop's inventory. {@code quantity} is the number of copies in stock.
 */
@Entity
@Table(name = "items")
public class Item extends BaseItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    protected Item() {
    }

    public Item(String name, BigDecimal price, int quantity) {
        super(name, price, quantity);
    }

    public Long getId() {
        return id;
    }
}
