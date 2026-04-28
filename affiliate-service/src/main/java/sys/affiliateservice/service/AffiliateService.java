package sys.affiliateservice.service;


import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import sys.affiliateservice.model.Affiliate;
import sys.affiliateservice.repository.AffiliateRepository;

import java.util.List;

@Service
@AllArgsConstructor
public class AffiliateService {
    private final AffiliateRepository repository;

    public List<Affiliate>  getAllAffiliate(){
        return repository.findAll();
    }

    public Affiliate getAffiliateById(Long id){
        return repository.findById(id)
                .orElseThrow(()->new RuntimeException("Affiliate with id " + id + "not found"));
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
