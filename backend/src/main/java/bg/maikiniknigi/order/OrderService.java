package bg.maikiniknigi.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import bg.maikiniknigi.common.ApiException;
import bg.maikiniknigi.common.InsufficientStockException;
import bg.maikiniknigi.common.NotFoundException;
import bg.maikiniknigi.item.Item;
import bg.maikiniknigi.item.ItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final ItemRepository itemRepository;
    private final DeliveryPolicy deliveryPolicy;

    public OrderService(OrderRepository orderRepository, ItemRepository itemRepository, DeliveryPolicy deliveryPolicy) {
        this.orderRepository = orderRepository;
        this.itemRepository = itemRepository;
        this.deliveryPolicy = deliveryPolicy;
    }

    /**
     * Creates an order and takes the books out of stock, all in one transaction.
     *
     * @param quantities      book id to number of copies
     * @param stripeSessionId Stripe Checkout Session id for card orders, {@code null} for cash
     * @param alreadyPaid     true when the customer has already paid (card). Then a stock shortage
     *                        must not cancel the order: it is saved and the shortage is logged for staff.
     *                        When false (cash), a shortage rejects the whole order and nothing changes.
     */
    @Transactional
    public Order placeOrder(CustomerDetails customer, PaymentType paymentType, Map<Long, Integer> quantities,
            String stripeSessionId, boolean alreadyPaid) {
        if (quantities.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your basket is empty");
        }

        // Read names and prices before changing stock (the stock updates clear the persistence context)
        Map<Long, Item> books = itemRepository.findAllById(quantities.keySet()).stream()
                .collect(Collectors.toMap(Item::getId, Function.identity()));

        Order order = new Order(customer, paymentType, Instant.now());
        order.setStripeSessionId(stripeSessionId);
        BigDecimal subtotal = BigDecimal.ZERO;

        for (Map.Entry<Long, Integer> entry : quantities.entrySet()) {
            Long bookId = entry.getKey();
            int amount = entry.getValue();
            Item book = books.get(bookId);
            if (book == null) {
                throw new NotFoundException("Book with id " + bookId + " no longer exists");
            }

            if (itemRepository.decreaseStock(bookId, amount) == 0) {
                if (!alreadyPaid) {
                    throw InsufficientStockException.forBook(book.getName(), book.getQuantity());
                }
                log.error("PAID ORDER OVERSOLD: Stripe session {} bought {} x book {} ('{}') but only {} in stock. "
                        + "Stock was left unchanged; please arrange a refund or restock.",
                        stripeSessionId, amount, bookId, book.getName(), book.getQuantity());
            }

            OrderItem line = new OrderItem(bookId, book.getName(), book.getPrice(), amount);
            order.addItem(line);
            subtotal = subtotal.add(line.getLineTotal());
        }

        BigDecimal deliveryFee = deliveryPolicy.feeFor(subtotal);
        order.setDeliveryFee(deliveryFee);
        order.setTotal(subtotal.add(deliveryFee));

        Order saved = orderRepository.save(order);
        log.info("Order {} created: {} payment, {} line(s), total {}", saved.getId(), paymentType,
                saved.getItems().size(), saved.getTotal());
        return saved;
    }

    @Transactional(readOnly = true)
    public boolean existsForStripeSession(String stripeSessionId) {
        return orderRepository.existsByStripeSessionId(stripeSessionId);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc().stream().map(OrderResponse::from).toList();
    }
}
