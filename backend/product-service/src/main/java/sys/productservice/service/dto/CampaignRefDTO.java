package sys.productservice.service.dto;

import java.math.BigDecimal;

public record CampaignRefDTO(Long id, String name, BigDecimal commissionRate, Boolean active) {}