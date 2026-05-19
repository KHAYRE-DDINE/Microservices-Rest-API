package sys.conversionservice.service.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import sys.conversionservice.model.Conversion;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionResponseDTO {
    private Long id;
    private Long affiliateId;
    private Long campaignId;
    private BigDecimal saleAmount;
    private BigDecimal commission;
    private Conversion.ConversionStatus status;
    private String metadata;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
}