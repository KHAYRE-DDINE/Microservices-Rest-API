package sys.affiliateservice.service.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonFormat
@AllArgsConstructor
@NoArgsConstructor
public class AffiliateResponse {
    private String id;
    private String name;
    private String email;
    private String phone;
    private boolean active;
    private String website;
    private Double totalEarned;
    private int totalconversions;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate updatedAt;


    private List<CampaignDTO> campaigns;

    private List<ConversionDTO> conversions;

    private List<ProductDTO> products;
}
