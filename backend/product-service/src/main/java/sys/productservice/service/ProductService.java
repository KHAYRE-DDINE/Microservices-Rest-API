package sys.productservice.service;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import sys.productservice.exception.ProductNotFoundException;
import sys.productservice.model.Product;
import sys.productservice.repository.ProductRepository;
import sys.productservice.service.dto.AffiliateRefDTO;
import sys.productservice.service.dto.CampaignRefDTO;
import sys.productservice.service.dto.ProductRequestDTO;
import sys.productservice.service.dto.ProductResponseDTO;

import java.util.*;
import java.util.stream.Collectors;


@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {
    private final ProductRepository productRepository;
    private final RestClient affiliateRestClient;
    private final RestClient campaignRestClient;

    public List<ProductResponseDTO> getAllProducts() {
        List<Product> products = productRepository.findByActiveTrue();
        return mapProductsWithNames(products);
    }

    public List<ProductResponseDTO> getProductsByAffiliateId(Long affiliateId){
        List<Product> products = productRepository.findByAffiliateIdAndActiveTrue(affiliateId);
        return mapProductsWithNames(products);
    }

    private List<ProductResponseDTO> mapProductsWithNames(List<Product> products) {
        // Collect unique IDs to minimize HTTP calls
        Set<Long> affiliateIds = products.stream()
                .map(Product::getAffiliateId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> campaignIds = products.stream()
                .map(Product::getCampaignId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Fetch unique affiliates and campaigns (one HTTP call per unique ID)
        Map<String, String> affiliateNameMap = new HashMap<>();
        for (Long id : affiliateIds) {
            try {
                AffiliateRefDTO affiliate = affiliateRestClient.get()
                        .uri("/api/affiliate/{id}", id)
                        .retrieve()
                        .body(AffiliateRefDTO.class);
                affiliateNameMap.put(String.valueOf(id), affiliate != null ? affiliate.name() : null);
            } catch (Exception e) {
                log.error("Could not fetch affiliate name for id: {} - Error: {}", id, e.getMessage(), e);
            }
        }

        Map<Long, String> campaignNameMap = new HashMap<>();
        for (Long id : campaignIds) {
            try {
                CampaignRefDTO campaign = campaignRestClient.get()
                        .uri("/api/campaigns/{id}", id)
                        .retrieve()
                        .body(CampaignRefDTO.class);
                campaignNameMap.put(id, campaign != null ? campaign.name() : null);
            } catch (Exception e) {
                log.warn("Could not fetch campaign name for id: {}", id);
            }
        }

        // Map products using the name lookups
        return products.stream()
                .map(p -> toResponseDTOWithNames(p, affiliateNameMap.get(String.valueOf(p.getAffiliateId())), campaignNameMap.get(p.getCampaignId())))
                .collect(Collectors.toList());
    }

    public ProductResponseDTO getProductById(Long id){
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        return toResponseDTOWithNames(product);
    }

    @Transactional
    public ProductResponseDTO createProduct(ProductRequestDTO product){
        validateAffiliate(product.getAffiliateId());

        if(product.getCampaignId() != null){
            validateCampaign(product.getCampaignId());
        }

        if(product.getSku() != null && productRepository.existsBySku(product.getSku())){
            throw new IllegalArgumentException("THe sku is already exist : " + product.getSku());
        }

        Product productBuilder = Product.builder()
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .commissionPercentage(product.getCommissionPercentage())
                .sku(product.getSku())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .affiliateId(product.getAffiliateId())
                .campaignId(product.getCampaignId())
                .active(product.getActive() != null ? product.getActive() : true)
                .build();

        Product saved = productRepository.save(productBuilder);
        return toResponseDTOWithNames(saved);
    }


    @Transactional
    public ProductResponseDTO updateProduct(Long id, ProductRequestDTO product){
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));

        if(!existingProduct.getAffiliateId().equals(product.getAffiliateId())){
            validateAffiliate(product.getAffiliateId());
        }

        if (product.getCampaignId() != null && existingProduct.getCampaignId().equals(product.getCampaignId())){
            validateCampaign(product.getCampaignId());
        }

        existingProduct.setName(product.getName());
        existingProduct.setDescription(product.getDescription());
        existingProduct.setPrice(product.getPrice());
        existingProduct.setCommissionPercentage(product.getCommissionPercentage());
        existingProduct.setSku(product.getSku());
        existingProduct.setCategory(product.getCategory());
        existingProduct.setImageUrl(product.getImageUrl());
        existingProduct.setCampaignId(product.getCampaignId());
        if(product.getActive() != null) existingProduct.setActive(product.getActive());

        Product updated = productRepository.save(existingProduct);
        return toResponseDTOWithNames(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ProductNotFoundException(id);
        }
        productRepository.deleteById(id);
    }

    public void validateAffiliate(Long affiliateId){
        try{
            AffiliateRefDTO affiliate = affiliateRestClient.get()
                    .uri("api/affiliate/{id}", affiliateId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new IllegalArgumentException("The affiliate not found with id : "+ affiliateId);
                    })
                    .body(AffiliateRefDTO.class);

            if(affiliate == null || !affiliate.active()){
                throw new IllegalArgumentException("The affiliate is inactive or doesn't exist: "+ affiliateId);
            }
        } catch (Exception e){
            if(e instanceof IllegalArgumentException) throw e;
            throw new RuntimeException("The service unavailable: "+ e.getMessage());
        }
    }

    private void validateCampaign(Long campaignId) {
        try {
            CampaignRefDTO campaign = campaignRestClient.get()
                    .uri("/api/campaigns/{id}", campaignId)
                    .retrieve()
                    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                        throw new IllegalArgumentException("Campaign not found or inactive: " + campaignId);
                    })
                    .body(CampaignRefDTO.class);
            if (campaign == null || !campaign.active()) {
                throw new IllegalArgumentException("Campaign is inactive or does not exist");
            }
        } catch (Exception e) {
            if (e instanceof IllegalArgumentException) throw e;
            throw new RuntimeException("Campaign service unavailable: " + e.getMessage());
        }
    }

    public ProductResponseDTO toResponseDTO(Product p){
        return ProductResponseDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .commissionPercentage(p.getCommissionPercentage())
                .price(p.getPrice())
                .affiliateId(p.getAffiliateId())
                .campaignId(p.getCampaignId())
                .sku(p.getSku())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private ProductResponseDTO toResponseDTOWithNames(Product p){
        String affiliateName = null;
        String campaignName = null;

        // Fetch affiliate name
        try {
            AffiliateRefDTO affiliate = affiliateRestClient.get()
                    .uri("/api/affiliate/{id}", p.getAffiliateId())
                    .retrieve()
                    .body(AffiliateRefDTO.class);
            if (affiliate != null) {
                affiliateName = affiliate.name();
            }
        } catch (Exception e) {
            log.warn("Could not fetch affiliate name for id: {}", p.getAffiliateId());
        }

        // Fetch campaign name
        if (p.getCampaignId() != null) {
            try {
                CampaignRefDTO campaign = campaignRestClient.get()
                        .uri("/api/campaigns/{id}", p.getCampaignId())
                        .retrieve()
                        .body(CampaignRefDTO.class);
                if (campaign != null) {
                    campaignName = campaign.name();
                }
            } catch (Exception e) {
                log.warn("Could not fetch campaign name for id: {}", p.getCampaignId());
            }
        }

        return ProductResponseDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .commissionPercentage(p.getCommissionPercentage())
                .price(p.getPrice())
                .affiliateId(p.getAffiliateId())
                .affiliateName(affiliateName)
                .campaignId(p.getCampaignId())
                .campaignName(campaignName)
                .sku(p.getSku())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }

    private ProductResponseDTO toResponseDTOWithNames(Product p, String affiliateName, String campaignName){
        return ProductResponseDTO.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .commissionPercentage(p.getCommissionPercentage())
                .price(p.getPrice())
                .affiliateId(p.getAffiliateId())
                .affiliateName(affiliateName)
                .campaignId(p.getCampaignId())
                .campaignName(campaignName)
                .sku(p.getSku())
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .active(p.getActive())
                .createdAt(p.getCreatedAt())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
