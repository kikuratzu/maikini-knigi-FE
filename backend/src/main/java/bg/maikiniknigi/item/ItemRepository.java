package bg.maikiniknigi.item;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ItemRepository extends JpaRepository<Item, Long> {

    List<Item> findAllByOrderByIdAsc();

    /**
     * Atomically removes {@code amount} copies from stock, but only if that many are available.
     *
     * @return 1 if the stock was reduced, 0 if there was not enough stock
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Item i set i.quantity = i.quantity - :amount where i.id = :id and i.quantity >= :amount")
    int decreaseStock(@Param("id") Long id, @Param("amount") int amount);

    /**
     * Atomically adds {@code amount} copies to stock.
     *
     * @return 1 if the item exists, otherwise 0
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update Item i set i.quantity = i.quantity + :amount where i.id = :id")
    int increaseStock(@Param("id") Long id, @Param("amount") int amount);
}
