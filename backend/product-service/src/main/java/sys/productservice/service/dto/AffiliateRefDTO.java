package sys.productservice.service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AffiliateRefDTO(String id, String name, String email, boolean active) {}