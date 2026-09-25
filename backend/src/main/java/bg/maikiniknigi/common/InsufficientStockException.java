package bg.maikiniknigi.common;

import org.springframework.http.HttpStatus;

public class InsufficientStockException extends ApiException {

    public InsufficientStockException(String message) {
        super(HttpStatus.CONFLICT, message);
    }

    public static InsufficientStockException forBook(String bookName, int inStock) {
        String message = inStock <= 0
                ? "'" + bookName + "' is out of stock"
                : "Only " + inStock + (inStock == 1 ? " copy" : " copies") + " of '" + bookName + "' left in stock";
        return new InsufficientStockException(message);
    }
}
