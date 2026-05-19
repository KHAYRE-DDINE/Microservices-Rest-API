package sys.affiliateservice.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import sys.affiliateservice.service.dto.ConversionDTO;

import java.util.List;

@Component
public class ConversionClient {

    private final RestClient conversionRestClient;

    @Autowired
    public ConversionClient(@Qualifier("conversionRestClient") RestClient conversionRestClient) {
        this.conversionRestClient = conversionRestClient;
    }

    public List<ConversionDTO> getConversionsByAffiliateId(Long affiliateId) {
        return conversionRestClient.get()
                .uri("/api/conversions/affiliate/{affiliateId}", affiliateId)
                .retrieve()
                .body(new ParameterizedTypeReference<List<ConversionDTO>>() {});
    }
}
