package sys.conversionservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sys.conversionservice.service.ConversionService;
import sys.conversionservice.service.dto.ConversionRequestDTO;
import sys.conversionservice.service.dto.ConversionResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/conversions")
@Tag(name = "Conversion Tracking", description = "APIs for recording sales conversions and calculating commissions")
public class ConversionController {

    private final ConversionService conversionService;

    public ConversionController(ConversionService conversionService) {
        this.conversionService = conversionService;
    }

    @GetMapping
    @Operation(summary = "Get all conversions")
    public ResponseEntity<List<ConversionResponseDTO>> getAll() {
        return ResponseEntity.ok(conversionService.getAllConversions());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get conversion by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conversion found"),
            @ApiResponse(responseCode = "404", description = "Conversion not found")
    })
    public ResponseEntity<ConversionResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(conversionService.getConversionById(id));
    }

    @PostMapping
    @Operation(summary = "Record a new conversion")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Conversion recorded"),
            @ApiResponse(responseCode = "400", description = "Invalid affiliate/campaign or input"),
            @ApiResponse(responseCode = "503", description = "Affiliate/Campaign service unavailable")
    })
    public ResponseEntity<ConversionResponseDTO> record(@RequestBody @Valid ConversionRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversionService.recordConversion(request));
    }

    @PostMapping("/{id}/refund")
    @Operation(summary = "Refund a completed conversion")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Conversion refunded"),
            @ApiResponse(responseCode = "404", description = "Conversion not found"),
            @ApiResponse(responseCode = "409", description = "Conversion cannot be refunded")
    })
    public ResponseEntity<ConversionResponseDTO> refund(@PathVariable Long id) {
        return ResponseEntity.ok(conversionService.refundConversion(id));
    }

    @GetMapping("/affiliate/{affiliateId}")
    @Operation(summary = "Get conversions by affiliate ID")
    public ResponseEntity<List<ConversionResponseDTO>> getByAffiliateId(@PathVariable Long affiliateId) {
        return ResponseEntity.ok(conversionService.getConversionsByAffiliateId(affiliateId));
    }
}