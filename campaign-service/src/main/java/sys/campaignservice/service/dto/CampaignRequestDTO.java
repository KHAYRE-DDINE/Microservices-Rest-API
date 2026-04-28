package sys.campaignservice.service.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Builder
@AllArgsConstructor
@NoArgsConstructor
@Data
public class CampaignRequestDTO {
    @NotBlank(message = "The field required")
    @Size(min = 3, max = 20, message = "The length of letters allowed is 20")
    private String name;

    @Size(max = 300, message = "Don't pass 300 letter")
    private String description;

    @DecimalMin(value = "0.00", inclusive = false, message = "")
    @DecimalMax(value = "100.0", inclusive = false, message = "")
    private BigDecimal commissionRate;

    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;


}
