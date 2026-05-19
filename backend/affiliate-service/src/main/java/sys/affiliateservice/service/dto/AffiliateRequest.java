package sys.affiliateservice.service.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AffiliateRequest {

    @NotBlank(message = "The field name is required")
    @Size(min= 3, max= 20, message = "The minimum length is 3 and maximum is 20 ")
    private String name;


    @NotBlank(message = "The email field is required")
    private String email;

    @Size(max = 500, message = "The maximum length of bio is 500 letter")
    private String bio;

    private String phone;
    private String website;
    private boolean active;
}
