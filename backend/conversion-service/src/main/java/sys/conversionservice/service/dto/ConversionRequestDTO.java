package sys.conversionservice.service.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionRequestDTO {
    @NotNull(message = "Affiliate ID is required")
    private Long affiliateId;

    @NotNull(message = "Campaign ID is required")
    private Long campaignId;

    @NotNull(message = "Sale amount is required")
    @DecimalMin(value = "0.01", message = "Sale amount must be greater than 0")
    private BigDecimal saleAmount;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private String metadata;
}