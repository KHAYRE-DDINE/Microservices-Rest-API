package sys.affiliateservice.service;


import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import sys.affiliateservice.model.Affiliate;
import sys.affiliateservice.repository.AffiliateRepository;
import sys.affiliateservice.service.dto.AffiliateDTO;
import sys.affiliateservice.service.dto.AffiliateResponse;
import sys.affiliateservice.service.dto.CampaignDTO;

import java.util.List;

@Service
@AllArgsConstructor
public class AffiliateService {
    private final AffiliateRepository repository;
    private final CampaignClient  campaignClient;
    public List<Affiliate>  getAllAffiliate(){
        return repository.findAll();
    }

    public AffiliateResponse getAffiliateById(Long id){
        Affiliate affiliate =  repository.findById(id)
                .orElseThrow(()->new RuntimeException("Affiliate with id " + id + "not found"));

        List<CampaignDTO> campaigns = campaignClient.getCampaignsByAffiliateId(id);

        return AffiliateResponse.builder()
                .id(String.valueOf(affiliate.getId()))
                .name(affiliate.getName())
                .email(affiliate.getEmail())
                .active(affiliate.isActive())
                .campaigns(campaigns)
                .build();
    }

    public Affiliate createAffiliate(Affiliate affiliate){
        return repository.save(affiliate);
    }

    public Affiliate updateAffiliate(Long id, Affiliate affDetails){
        Affiliate existingAff = repository.getReferenceById(id);
        existingAff.setName(affDetails.getName());
        existingAff.setEmail(affDetails.getEmail());
        existingAff.setActive(affDetails.isActive());

        return repository.save(existingAff);
    }

    public void deleteAff (Long id){
        if (!repository.existsById(id)){
            throw new RuntimeException("The affiliate not exist with id" + id);
        }

        repository.deleteById(id);
    }
}
