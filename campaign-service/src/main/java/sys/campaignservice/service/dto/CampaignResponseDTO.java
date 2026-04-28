package sys.campaignservice.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CampaignResponseDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal commissionRate;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH-mm-ss")
    private LocalDate startDate;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH-mm-ss")
    private LocalDate endDate;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH-mm-ss")
    private LocalDate createdAt;
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH-mm-ss")
    private LocalDate updatedAt;

    private Boolean active;

}
