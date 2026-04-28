package sys.campaignservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sys.campaignservice.model.Campaign;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    Optional<Campaign> findByIdAndActiveTrue(Long id);

    List<Campaign> findByActiveTrue();

    @Query("SELECT c FROM Campaign c WHERE c.active = true AND (c.startDate IS NULL OR c.startDate <= :now) AND (c.endDate IS NULL OR c.endDate >= :now)")
    List<Campaign> findCurrentActiveCampaigns(@Param("now") LocalDate now);
}