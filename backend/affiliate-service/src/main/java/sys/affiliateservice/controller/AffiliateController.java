package sys.affiliateservice.controller;


import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sys.affiliateservice.model.Affiliate;
import sys.affiliateservice.service.AffiliateService;
import sys.affiliateservice.service.dto.AffiliateRequest;
import sys.affiliateservice.service.dto.AffiliateResponse;

import java.util.List;

@RestController
@RequestMapping("api/affiliate")
@AllArgsConstructor
public class AffiliateController {
    public AffiliateService affiliateService;

    @GetMapping
    public ResponseEntity<List<AffiliateResponse>> getAllAffiliate (){
        return ResponseEntity.ok(affiliateService.getAllAffiliate());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AffiliateResponse> getAffById(@PathVariable Long id){
        return ResponseEntity.ok(affiliateService.getAffiliateById(id));
    }

    @PostMapping
    public ResponseEntity<AffiliateResponse> createAffiliate(@RequestBody @Valid AffiliateRequest request){
        Affiliate affiliate = new Affiliate();
        affiliate.setName(request.getName());
        affiliate.setEmail(request.getEmail());
        affiliate.setPhone(request.getPhone());
        affiliate.setWebsite(request.getWebsite());
        affiliate.setActive(request.isActive());
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(affiliateService.createAffiliate(affiliate));
    }

    @PutMapping("{id}")
    public ResponseEntity<AffiliateResponse> updateAff(@PathVariable Long id, @RequestBody @Valid AffiliateRequest request){
        Affiliate affiliate = new Affiliate();
        affiliate.setName(request.getName());
        affiliate.setEmail(request.getEmail());
        affiliate.setPhone(request.getPhone());
        affiliate.setWebsite(request.getWebsite());
        affiliate.setActive(request.isActive());
        
        return ResponseEntity.ok(affiliateService.updateAffiliate(id, affiliate));
    }

    @DeleteMapping("/{id}")
    public void removeAffiliate(@PathVariable Long id){
        affiliateService.deleteAff(id);
    }
}
