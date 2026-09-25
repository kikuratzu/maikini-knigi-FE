package bg.maikiniknigi.item;

import java.util.List;

import bg.maikiniknigi.common.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ItemService {

    private static final Logger log = LoggerFactory.getLogger(ItemService.class);

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    @Transactional(readOnly = true)
    public List<ItemDto> getItems() {
        return itemRepository.findAllByOrderByIdAsc().stream().map(ItemDto::from).toList();
    }

    @Transactional(readOnly = true)
    public Item getItem(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Book with id " + id + " was not found"));
    }

    /**
     * Adds copies to a book's stock (used by admins to restock the inventory).
     */
    @Transactional
    public ItemDto addQuantity(Long id, int amount) {
        if (itemRepository.increaseStock(id, amount) == 0) {
            throw new NotFoundException("Book with id " + id + " was not found");
        }
        Item item = getItem(id);
        log.info("Stock for book {} ('{}') increased by {} to {}", id, item.getName(), amount, item.getQuantity());
        return ItemDto.from(item);
    }
}
