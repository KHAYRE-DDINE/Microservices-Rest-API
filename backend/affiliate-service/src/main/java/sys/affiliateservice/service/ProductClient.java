package sys.affiliateservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import sys.affiliateservice.service.dto.ProductDTO;

import java.util.List;

@Component
public class ProductClient {

    private final RestClient productRestClient;

    @Autowired
    public ProductClient(@Qualifier("productRestClient") RestClient productRestClient) {
        this.productRestClient = productRestClient;
    }

    public List<ProductDTO> getProductsByAffiliateId(Long affiliateId) {
        return productRestClient.get()
                .uri("/api/products/affiliate/{affiliateId}", affiliateId)
                .retrieve()
                .body(new ParameterizedTypeReference<List<ProductDTO>>() {});
    }
}
