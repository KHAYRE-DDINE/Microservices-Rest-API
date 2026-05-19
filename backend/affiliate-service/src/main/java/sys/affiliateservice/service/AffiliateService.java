package sys.affiliateservice.service;


import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sys.affiliateservice.model.Affiliate;
import sys.affiliateservice.repository.AffiliateRepository;
import sys.affiliateservice.service.dto.AffiliateResponse;
import sys.affiliateservice.service.dto.CampaignDTO;
import sys.affiliateservice.service.dto.ConversionDTO;
import sys.affiliateservice.service.dto.ProductDTO;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
@Transactional(readOnly = true)
public class AffiliateService {
    private final AffiliateRepository repository;
    private final CampaignClient campaignClient;
    private final ConversionClient conversionClient;
    private final ProductClient productClient;

    public List<AffiliateResponse> getAllAffiliate() {
        List<Affiliate> affiliates = repository.findAll();

        return affiliates.stream().map(
                affiliate -> buildAffiliateResponse(affiliate)
        ).collect(Collectors.toList());
    }

    private AffiliateResponse buildAffiliateResponse(Affiliate affiliate) {
        List<CampaignDTO> campaigns = Collections.emptyList();
        List<ConversionDTO> conversions = Collections.emptyList();
        List<ProductDTO> products = Collections.emptyList();

        // Prevent infinite recursion loops by skipping full deep-tree fetching
        // Other services (product, campaign, etc) call getAffiliateById to validate the affiliate
        // If we call them back, it triggers an infinite HTTP fetch loop.

        // Calculate totals
        double totalEarned = conversions.stream()
                .map(ConversionDTO::getCommission)
                .filter(c -> c != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();
        int totalConversions = conversions.size();

        return AffiliateResponse.builder()
                .id(String.valueOf(affiliate.getId()))
                .name(affiliate.getName())
                .email(affiliate.getEmail())
                .active(affiliate.isActive())
                .phone(affiliate.getPhone())
                .website(affiliate.getWebsite())
                .totalEarned(totalEarned)
                .totalconversions(totalConversions)
                .createdAt(affiliate.getCreatedAt() != null ? affiliate.getCreatedAt().toLocalDate() : null)
                .updatedAt(affiliate.getUpdatedAt() != null ? affiliate.getUpdatedAt().toLocalDate() : null)
                .campaigns(campaigns)
                .conversions(conversions)
                .products(products)
                .build();
    }

    public AffiliateResponse getAffiliateById(Long id) {
        Affiliate affiliate = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affiliate with id " + id + " not found"));
        return buildAffiliateResponse(affiliate);
    }

    @Transactional
    public AffiliateResponse createAffiliate(Affiliate affiliate){
        Affiliate saved = repository.save(affiliate);
        return buildAffiliateResponse(saved);
    }

    @Transactional
    public AffiliateResponse updateAffiliate(Long id, Affiliate affDetails){
        Affiliate existingAff = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Affiliate with id " + id + " not found"));
        existingAff.setName(affDetails.getName());
        existingAff.setEmail(affDetails.getEmail());
        existingAff.setActive(affDetails.isActive());
        existingAff.setPhone(affDetails.getPhone());
        existingAff.setWebsite(affDetails.getWebsite());

        Affiliate saved = repository.save(existingAff);
        return buildAffiliateResponse(saved);
    }

    @Transactional
    public void deleteAff (Long id){
        if (!repository.existsById(id)){
            throw new RuntimeException("The affiliate not exist with id" + id);
        }

        repository.deleteById(id);
    }
}
