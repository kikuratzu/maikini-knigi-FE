package bg.maikiniknigi.cart;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import bg.maikiniknigi.common.InsufficientStockException;
import bg.maikiniknigi.common.NotFoundException;
import bg.maikiniknigi.config.AppProperties;
import bg.maikiniknigi.item.Item;
import bg.maikiniknigi.item.ItemService;
import bg.maikiniknigi.order.DeliveryPolicy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.HashOperations;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import tools.jackson.databind.json.JsonMapper;

/**
 * Keeps each anonymous shopper's basket in a Redis hash:
 * key {@code cart:<anonymous id>}, one field per book id, value = the {@link CartItem} as JSON.
 * The whole basket expires after the configured TTL; every change resets the timer.
 */
@Service
public class CartService {

    private static final Logger log = LoggerFactory.getLogger(CartService.class);
    private static final String KEY_PREFIX = "cart:";

    private final StringRedisTemplate redis;
    private final HashOperations<String, String, String> hash;
    private final JsonMapper jsonMapper;
    private final ItemService itemService;
    private final DeliveryPolicy deliveryPolicy;
    private final Duration ttl;

    public CartService(StringRedisTemplate redis, JsonMapper jsonMapper, ItemService itemService,
            DeliveryPolicy deliveryPolicy, AppProperties properties) {
        this.redis = redis;
        this.hash = redis.opsForHash();
        this.jsonMapper = jsonMapper;
        this.itemService = itemService;
        this.deliveryPolicy = deliveryPolicy;
        this.ttl = properties.cart().ttl();
    }

    public List<CartItem> getItems(String anonymousId) {
        return hash.values(key(anonymousId)).stream()
                .map(json -> jsonMapper.readValue(json, CartItem.class))
                .sorted(Comparator.comparing(CartItem::itemId))
                .toList();
    }

    /** Book id to number of copies, in a stable order. */
    public Map<Long, Integer> getQuantities(String anonymousId) {
        Map<Long, Integer> quantities = new LinkedHashMap<>();
        getItems(anonymousId).forEach(item -> quantities.put(item.itemId(), item.quantity()));
        return quantities;
    }

    public void addItem(String anonymousId, Long itemId, int quantity) {
        Item book = itemService.getItem(itemId);
        String key = key(anonymousId);
        int alreadyInCart = findItem(key, itemId).map(CartItem::quantity).orElse(0);
        int newQuantity = alreadyInCart + quantity;
        if (newQuantity > book.getQuantity()) {
            throw InsufficientStockException.forBook(book.getName(), book.getQuantity());
        }
        // Store the current name and price, so the basket reflects the latest catalogue data
        save(key, new CartItem(book.getId(), book.getName(), book.getPrice(), newQuantity));
        log.info("Cart {}: added {} x book {} (now {} in basket)", anonymousId, quantity, itemId, newQuantity);
    }

    public void setQuantity(String anonymousId, Long itemId, int quantity) {
        String key = key(anonymousId);
        CartItem current = findItem(key, itemId)
                .orElseThrow(() -> new NotFoundException("This book is not in your basket"));
        if (quantity == 0) {
            hash.delete(key, itemId.toString());
            log.info("Cart {}: removed book {}", anonymousId, itemId);
            return;
        }
        Item book = itemService.getItem(itemId);
        if (quantity > book.getQuantity()) {
            throw InsufficientStockException.forBook(book.getName(), book.getQuantity());
        }
        save(key, current.withQuantity(quantity));
        log.info("Cart {}: book {} quantity set to {}", anonymousId, itemId, quantity);
    }

    public void clear(String anonymousId) {
        if (Boolean.TRUE.equals(redis.delete(key(anonymousId)))) {
            log.info("Cart {}: cleared", anonymousId);
        }
    }

    public CartResponse toResponse(List<CartItem> items) {
        BigDecimal subtotal = items.stream().map(CartItem::lineTotal).reduce(BigDecimal.ZERO.setScale(2), BigDecimal::add);
        BigDecimal deliveryFee = deliveryPolicy.feeFor(subtotal);
        int totalQuantity = items.stream().mapToInt(CartItem::quantity).sum();
        return new CartResponse(items.stream().map(CartResponse.Line::from).toList(), totalQuantity, subtotal,
                deliveryFee, subtotal.add(deliveryFee), deliveryPolicy.freeFrom());
    }

    public CartResponse emptyCart() {
        return toResponse(List.of());
    }

    private Optional<CartItem> findItem(String key, Long itemId) {
        String json = hash.get(key, itemId.toString());
        return Optional.ofNullable(json).map(value -> jsonMapper.readValue(value, CartItem.class));
    }

    private void save(String key, CartItem item) {
        hash.put(key, item.itemId().toString(), jsonMapper.writeValueAsString(item));
        redis.expire(key, ttl);
    }

    private static String key(String anonymousId) {
        return KEY_PREFIX + anonymousId;
    }
}
