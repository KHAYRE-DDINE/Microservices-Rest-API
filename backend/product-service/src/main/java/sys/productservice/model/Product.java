package sys.productservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products", indexes = {
        @Index(name = "idx_product_affiliate", columnList = "affiliate_id"),
        @Index(name = "idx_product_campaign", columnList = "campaign_id"),
        @Index(name = "idx_product_sku", columnList = "sku", unique = true),
        @Index(name = "idx_product_active", columnList = "active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Product name is required")
    @Size(min = 3, max = 150, message = "Name must be between 3 and 150 characters")
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    @Column(name = "description", length = 1000)
    private String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Commission cannot be negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "Commission cannot exceed 100%")
    @Column(name = "commission_percentage", precision = 5, scale = 2)
    private BigDecimal commissionPercentage;

    @Column(name = "sku", length = 50)
    private String sku;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "affiliate_id", nullable = false)
    private Long affiliateId;

    @Column(name = "campaign_id")
    private Long campaignId;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (this.active == null) this.active = true;
    }
}