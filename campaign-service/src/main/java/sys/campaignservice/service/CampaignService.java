package sys.campaignservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import sys.campaignservice.exception.CampaignNotFoundException;
import sys.campaignservice.model.Campaign;
import sys.campaignservice.repository.CampaignRepository;
import sys.campaignservice.service.dto.CampaignRequestDTO;
import sys.campaignservice.service.dto.CampaignResponseDTO;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CampaignService {

    private final CampaignRepository campaignRepository;

    public List<CampaignResponseDTO> getAllCampaigns() {
        return campaignRepository.findAll().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public CampaignResponseDTO getCampaignById(Long id) {
        Campaign campaign = campaignRepository.findById(id)
                .orElseThrow(() -> new CampaignNotFoundException(id));
        return toResponseDTO(campaign);
    }

    public List<CampaignResponseDTO> getCampaignByAffiliateId(Long AffiliateId){
        return campaignRepository.findByAffiliateId(AffiliateId).stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<CampaignResponseDTO> getActiveCampaigns() {
        return campaignRepository.findByActiveTrue().stream()
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CampaignResponseDTO createCampaign(CampaignRequestDTO request) {
        Campaign campaign = Campaign.builder()
                .name(request.getName())
                .description(request.getDescription())
                .commissionRate(request.getCommissionRate())
                .affiliateId(request.getAffiliateId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();
        Campaign saved = campaignRepository.save(campaign);
        log.info("Campaign created: {}", saved.getId());
        return toResponseDTO(saved);
    }

    @Transactional
    public CampaignResponseDTO updateCampaign(Long id, CampaignRequestDTO request) {
        Campaign existing = campaignRepository.findById(id)
                .orElseThrow(() -> new CampaignNotFoundException(id));

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setCommissionRate(request.getCommissionRate());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setAffiliateId(request.getAffiliateId());
        if (request.getActive() != null) existing.setActive(request.getActive());

        Campaign updated = campaignRepository.save(existing);
        return toResponseDTO(updated);
    }

    @Transactional
    public void deleteCampaign(Long id) {
        if (!campaignRepository.existsById(id)) {
            throw new CampaignNotFoundException(id);
        }
        campaignRepository.deleteById(id);
    }

    private CampaignResponseDTO toResponseDTO(Campaign c) {
        return CampaignResponseDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .commissionRate(c.getCommissionRate())
                .active(c.getActive())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .affiliateId(c.getAffiliateId())
                .build();
    }
}