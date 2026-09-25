package bg.maikiniknigi.order;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateOrderRequest(
        @NotBlank(message = "Please enter your first name")
        @Size(max = 100, message = "First name is too long")
        String firstName,

        @NotBlank(message = "Please enter your last name")
        @Size(max = 100, message = "Last name is too long")
        String lastName,

        @NotBlank(message = "Please enter your email")
        @Email(message = "Please enter a valid email")
        @Size(max = 255, message = "Email is too long")
        String email,

        @NotBlank(message = "Please enter your delivery address")
        @Size(max = 255, message = "Address is too long")
        String address,

        @NotBlank(message = "Please enter your phone number")
        @Pattern(regexp = "^\\+?[0-9 ()-]{7,20}$", message = "Please enter a valid phone number")
        String phoneNumber,

        @NotNull(message = "Please choose a payment type")
        PaymentType paymentType) {

    public CustomerDetails customer() {
        return new CustomerDetails(firstName.trim(), lastName.trim(), email.trim(), address.trim(), phoneNumber.trim());
    }
}
