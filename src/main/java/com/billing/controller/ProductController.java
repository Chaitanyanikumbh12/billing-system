package com.billing.controller;

import com.billing.model.Product;
import com.billing.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> addProduct(@RequestBody Product product) {
        if (product.getProductName() == null || product.getPrice() == null || product.getStock() == null) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "All fields required"));
        }
        productRepository.save(product);
        return ResponseEntity.ok(Map.of("status", "success"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProduct(@PathVariable Long id) {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
