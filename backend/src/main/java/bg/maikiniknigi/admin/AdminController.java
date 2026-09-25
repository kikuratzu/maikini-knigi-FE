package bg.maikiniknigi.admin;

import java.util.List;

import bg.maikiniknigi.item.ItemDto;
import bg.maikiniknigi.item.ItemService;
import bg.maikiniknigi.order.OrderResponse;
import bg.maikiniknigi.order.OrderService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin-only endpoints (HTTP Basic, role ADMIN; see SecurityConfig).
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final OrderService orderService;
    private final ItemService itemService;

    public AdminController(OrderService orderService, ItemService itemService) {
        this.orderService = orderService;
        this.itemService = itemService;
    }

    /** Every order, newest first. */
    @GetMapping("/orders")
    public List<OrderResponse> getAllOrders(Authentication authentication) {
        log.info("Admin '{}' listed all orders", authentication.getName());
        return orderService.getAllOrders();
    }

    /** Adds copies to a book's stock. */
    @PatchMapping("/items/{itemId}/quantity")
    public ItemDto addBookQuantity(@PathVariable Long itemId, @Valid @RequestBody AddQuantityRequest body,
            Authentication authentication) {
        log.info("Admin '{}' is adding {} copies to book {}", authentication.getName(), body.amount(), itemId);
        return itemService.addQuantity(itemId, body.amount());
    }
}
