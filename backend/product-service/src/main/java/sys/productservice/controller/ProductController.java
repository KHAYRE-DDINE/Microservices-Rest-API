package sys.productservice.controller;


import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import sys.productservice.service.ProductService;
import sys.productservice.service.dto.ProductRequestDTO;
import sys.productservice.service.dto.ProductResponseDTO;

import java.util.List;

@RestController
@RequestMapping("api/products")
@AllArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductResponseDTO>> getAllProducts(){
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable Long id){
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/affiliate/{affiliateId}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByAffiliateId(@PathVariable Long affiliateId){
        return ResponseEntity.ok(productService.getProductsByAffiliateId(affiliateId));
    }

    @PostMapping
    public ResponseEntity<ProductResponseDTO> createProduct(@RequestBody @Valid ProductRequestDTO body){
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.createProduct(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponseDTO> updateProduct(@PathVariable Long id, @RequestBody ProductRequestDTO updatedBody){
        return ResponseEntity.ok(productService.updateProduct(id, updatedBody));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}
