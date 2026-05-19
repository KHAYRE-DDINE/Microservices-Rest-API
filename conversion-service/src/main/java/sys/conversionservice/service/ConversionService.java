package sys.conversionservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import sys.conversionservice.exception.ConversionValidationException;
import sys.conversionservice.model.Conversion;
import sys.conversionservice.repository.ConversionRepository;
import sys.conversionservice.service.dto.*;

import java.math.BigDecimal;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConversionService {

    private final ConversionRepository conversionRepository;
    private final RestClient affiliateRestClient;
    private final RestClient campaignRestClient;

    public List<ConversionResponseDTO> getAllConversions() {
        return conversionRepository.findAll().stream()
                .map(this::toResponseDTO)
                .toList();
    }

    public ConversionResponseDTO getConversionById(Long id) {
        Conversion conversion = conversionRepository.findById(id)
                .orElseThrow(() -> new ConversionValidationException("Conversion not found with id: " + id));
        return toResponseDTO(conversion);
    }

    @Transactional
    public ConversionResponseDTO recordConversion(ConversionRequestDTO request) {
        // 1. Validate Affiliate
        AffiliateRefDTO affiliate = affiliateRestClient.get()
                .uri("/api/affiliate/{id}", request.getAffiliateId())
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new ConversionValidationException("Affiliate not found or inactive: " + request.getAffiliateId());
                })
                .body(AffiliateRefDTO.class);

        if (affiliate == null || !affiliate.active()) {
            throw new ConversionValidationException("Affiliate is inactive or does not exist");
        }

        // 2. Validate Campaign
        CampaignRefDTO campaign = campaignRestClient.get()
                .uri("/api/campaigns/{id}", request.getCampaignId())
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new ConversionValidationException("Campaign not found or inactive: " + request.getCampaignId());
                })
                .body(CampaignRefDTO.class);

        if (campaign == null || !campaign.active()) {
            throw new ConversionValidationException("Campaign is inactive or does not exist");
        }

        // 3. Calculate Commission
        BigDecimal commission = request.getSaleAmount()
                .multiply(campaign.commissionRate())
                .divide(BigDecimal.valueOf(100), 2, BigDecimal.ROUND_HALF_UP);

        // 4. Save Conversion
        Conversion conversion = Conversion.builder()
                .affiliateId(request.getAffiliateId())
                .campaignId(request.getCampaignId())
                .saleAmount(request.getSaleAmount())
                .commission(commission)
                .status(Conversion.ConversionStatus.COMPLETED)
                .metadata(request.getMetadata())
                .build();

        Conversion saved = conversionRepository.save(conversion);
        log.info("Conversion recorded: ID={}, Affiliate={}, Campaign={}, Commission={}",
                saved.getId(), saved.getAffiliateId(), saved.getCampaignId(), saved.getCommission());
        return toResponseDTO(saved);
    }

    @Transactional
    public ConversionResponseDTO refundConversion(Long id) {
        Conversion conversion = conversionRepository.findById(id)
                .orElseThrow(() -> new ConversionValidationException("Conversion not found with id: " + id));

        if (conversion.getStatus() != Conversion.ConversionStatus.COMPLETED) {
            throw new ConversionValidationException("Only completed conversions can be refunded");
        }

        conversion.setStatus(Conversion.ConversionStatus.REFUNDED);
        conversion.setCommission(BigDecimal.ZERO);
        conversionRepository.save(conversion);
        return toResponseDTO(conversion);
    }

    private ConversionResponseDTO toResponseDTO(Conversion c) {
        return ConversionResponseDTO.builder()
                .id(c.getId())
                .affiliateId(c.getAffiliateId())
                .campaignId(c.getCampaignId())
                .saleAmount(c.getSaleAmount())
                .commission(c.getCommission())
                .status(c.getStatus())
                .metadata(c.getMetadata())
                .createdAt(c.getCreatedAt())
                .build();
    }
}