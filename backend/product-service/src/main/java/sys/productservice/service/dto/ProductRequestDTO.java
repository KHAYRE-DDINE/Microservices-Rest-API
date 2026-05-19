package sys.productservice.service.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequestDTO {
    @NotBlank(message = "Product name is required")
    @Size(min = 3, max = 150, message = "Name must be between 3 and 150 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Commission cannot be negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "Commission cannot exceed 100%")
    private BigDecimal commissionPercentage;

    private String sku;
    private String category;
    private String imageUrl;

    @NotNull(message = "Affiliate ID is required")
    private Long affiliateId;

    private Long campaignId;
    private Boolean active;
}