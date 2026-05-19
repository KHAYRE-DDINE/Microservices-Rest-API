package sys.affiliateservice.service.dto;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CampaignDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal commissionRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
}
