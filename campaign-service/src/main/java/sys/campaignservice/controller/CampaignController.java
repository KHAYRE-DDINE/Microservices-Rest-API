package sys.campaignservice.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sys.campaignservice.service.CampaignService;
import sys.campaignservice.service.dto.CampaignRequestDTO;
import sys.campaignservice.service.dto.CampaignResponseDTO;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@Tag(name = "Campaign Management", description = "APIs for managing marketing campaigns")
public class CampaignController {

    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping
    @Operation(summary = "Get all campaigns")
    public ResponseEntity<List<CampaignResponseDTO>> getAll() {
        return ResponseEntity.ok(campaignService.getAllCampaigns());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get campaign by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Campaign found"),
            @ApiResponse(responseCode = "404", description = "Campaign not found")
    })
    public ResponseEntity<CampaignResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(campaignService.getCampaignById(id));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active campaigns")
    public ResponseEntity<List<CampaignResponseDTO>> getActive() {
        return ResponseEntity.ok(campaignService.getActiveCampaigns());
    }

    @PostMapping
    @Operation(summary = "Create campaign")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Campaign created"),
            @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    public ResponseEntity<CampaignResponseDTO> create(@RequestBody @Valid CampaignRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(campaignService.createCampaign(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update campaign")
    public ResponseEntity<CampaignResponseDTO> update(@PathVariable Long id, @RequestBody @Valid CampaignRequestDTO request) {
        return ResponseEntity.ok(campaignService.updateCampaign(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete campaign")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Campaign deleted"),
            @ApiResponse(responseCode = "404", description = "Campaign not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        campaignService.deleteCampaign(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/affiliate/{affiliateId}")
    public ResponseEntity<List<CampaignResponseDTO>> getByAffiliateId(@PathVariable Long affId){
        return ResponseEntity.ok(campaignService.getCampaignByAffiliateId(affId));
    }
}