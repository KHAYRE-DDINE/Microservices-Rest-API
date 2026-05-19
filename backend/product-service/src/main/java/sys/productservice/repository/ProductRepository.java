package sys.productservice.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import sys.productservice.model.Product;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAffiliateId(Long affiliateId);
    List<Product> findByCampaignId(Long campaignId);
    List<Product> findByAffiliateIdAndActiveTrue(Long affiliateId);
    List<Product> findByActiveTrue();
    Boolean existsBySku(String sku);

    @Query("SELECT p FROM Product p WHERE p.affiliateId = :affiliateId AND (p.name ILIKE %:keyword% OR p.sku ILIKE %:keyword)")
    List<Product> seearchByAffiliateId(@Param("affiliateId") Long affiliateId, @Param("keyword") String keyword);

}
