package sys.affiliateservice.service.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

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

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH-mm-ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH-mm-ss")
    private LocalDateTime updatedAt;
}
