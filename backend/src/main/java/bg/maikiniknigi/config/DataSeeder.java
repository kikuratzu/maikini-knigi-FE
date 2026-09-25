package bg.maikiniknigi.config;

import java.math.BigDecimal;
import java.util.List;

import bg.maikiniknigi.item.Item;
import bg.maikiniknigi.item.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Puts three books in the inventory on first start (only when the items table is empty).
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final ItemRepository itemRepository;

    public DataSeeder(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (itemRepository.count() > 0) {
            log.info("Inventory already has {} book(s); skipping seed data", itemRepository.count());
            return;
        }
        List<Item> books = List.of(
                new Item("Time Shelter", new BigDecimal("18.90"), 12),
                new Item("Dune", new BigDecimal("17.90"), 8),
                new Item("Pride and Prejudice", new BigDecimal("16.90"), 5));
        itemRepository.saveAll(books);
        log.info("Seeded inventory with {} books", books.size());
    }
}
