package sys.affiliateservice.service;


import lombok.AllArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import sys.affiliateservice.service.dto.CampaignDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CampaignClient {
    private final RestClient campaignRestClient;

    public CampaignDTO getCampaignByID(Long id){
        return campaignRestClient.get()
                .uri("api/campaigns/{id}", id)
                .retrieve()
                .body(CampaignDTO.class);
    }

    public List<CampaignDTO> getCampaignsByAffiliateId(Long affiliateId) {
        return campaignRestClient.get()
                .uri("/api/campaigns/affiliate/{affiliateId}", affiliateId)
                .retrieve()
                .body(new ParameterizedTypeReference<List<CampaignDTO>>() {});
    }

    public List<CampaignDTO> getCampaignsByIds(List<Long> ids ){
        return ids.stream()
                .map(this::getCampaignByID)
                .collect(Collectors.toList());
    }
}
