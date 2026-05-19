package sys.conversionservice.service.dto;

import java.math.BigDecimal;

public record ProductRefDTO(
    Long id,
    String name,
    BigDecimal price,
    BigDecimal commissionPercentage,
    Boolean active
) {}
