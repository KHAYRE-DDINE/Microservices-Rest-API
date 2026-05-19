package sys.conversionservice.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "conversions", indexes = {
        @Index(name = "idx_conversion_affiliate", columnList = "affiliate_id"),
        @Index(name = "idx_conversion_campaign", columnList = "campaign_id"),
        @Index(name = "idx_conversion_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Affiliate ID is required")
    @Column(name = "affiliate_id", nullable = false)
    private Long affiliateId;

    @NotNull(message = "Campaign ID is required")
    @Column(name = "campaign_id", nullable = false)
    private Long campaignId;

    @NotNull(message = "Sale amount is required")
    @DecimalMin(value = "0.01", message = "Sale amount must be greater than 0")
    @Column(name = "sale_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal saleAmount;

    @Column(name = "commission", precision = 10, scale = 2)
    private BigDecimal commission;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private ConversionStatus status = ConversionStatus.PENDING;

    @Column(name = "metadata", length = 1000)
    private String metadata;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum ConversionStatus {
        PENDING, VALIDATED, COMPLETED, FAILED, REFUNDED
    }
}