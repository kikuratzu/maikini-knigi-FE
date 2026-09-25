package bg.maikiniknigi.order;

/**
 * Who the order is for and where it goes.
 */
public record CustomerDetails(String firstName, String lastName, String email, String address, String phoneNumber) {
}
