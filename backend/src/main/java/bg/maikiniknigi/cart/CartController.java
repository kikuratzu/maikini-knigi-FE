package bg.maikiniknigi.cart;

import bg.maikiniknigi.common.NotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    private final AnonymousIdService anonymousIdService;

    public CartController(CartService cartService, AnonymousIdService anonymousIdService) {
        this.cartService = cartService;
        this.anonymousIdService = anonymousIdService;
    }

    /** Adds a book to the basket. Gives the shopper an anonymous-id cookie if they don't have one yet. */
    @PostMapping("/items")
    public CartResponse addItem(@Valid @RequestBody AddToCartRequest body, HttpServletRequest request,
            HttpServletResponse response) {
        String anonymousId = anonymousIdService.findOrCreate(request, response);
        cartService.addItem(anonymousId, body.itemId(), body.quantityOrDefault());
        return cartService.toResponse(cartService.getItems(anonymousId));
    }

    /** The shopper's basket (empty if they have no anonymous id yet). */
    @GetMapping
    public CartResponse getCartItems(HttpServletRequest request) {
        return anonymousIdService.find(request)
                .map(id -> cartService.toResponse(cartService.getItems(id)))
                .orElseGet(cartService::emptyCart);
    }

    /** Changes how many copies of a book are in the basket; 0 removes it. */
    @PutMapping("/items/{itemId}")
    public CartResponse updateItem(@PathVariable Long itemId, @Valid @RequestBody UpdateCartItemRequest body,
            HttpServletRequest request) {
        String anonymousId = anonymousIdService.find(request)
                .orElseThrow(() -> new NotFoundException("Your basket is empty"));
        cartService.setQuantity(anonymousId, itemId, body.quantity());
        return cartService.toResponse(cartService.getItems(anonymousId));
    }

    /** Empties the basket. */
    @DeleteMapping
    public CartResponse clear(HttpServletRequest request) {
        anonymousIdService.find(request).ifPresent(cartService::clear);
        return cartService.emptyCart();
    }
}
