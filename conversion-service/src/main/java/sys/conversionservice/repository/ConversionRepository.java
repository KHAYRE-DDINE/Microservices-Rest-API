package sys.conversionservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sys.conversionservice.model.Conversion;

import java.util.List;

@Repository
public interface ConversionRepository extends JpaRepository<Conversion, Long> {
    List<Conversion> findByAffiliateId(Long affiliateId);
    List<Conversion> findByCampaignId(Long campaignId);
    List<Conversion> findByStatus(Conversion.ConversionStatus status);
    @Query("SELECT c FROM Conversion c WHERE c.affiliateId = :affiliateId AND c.status = 'COMPLETED'")
    List<Conversion> findCompletedByAffiliate(@Param("affiliateId") Long affiliateId);
}