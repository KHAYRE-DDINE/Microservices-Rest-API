package sys.affiliateservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sys.affiliateservice.model.Affiliate;

import java.util.List;
import java.util.Optional;


@Repository
public interface AffiliateRepository extends JpaRepository<Affiliate, Long> {
    @Override
    Optional<Affiliate> findById(Long id);

    boolean existsAffiliateByEmail(String email);

    @Query("SELECT a FROM Affiliate a WHERE a.id = :id")
    Affiliate searchAffiliate(@Param("keyword") String keyword);
}
