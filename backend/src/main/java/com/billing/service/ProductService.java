package com.billing.service;

import com.billing.dto.request.ProductRequest;
import com.billing.entity.Product;
import com.billing.exception.AppException;
import com.billing.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findByIsActiveTrueOrderByNameAsc();
    }

    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    public Product getProductById(UUID id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new AppException("Product not found", HttpStatus.NOT_FOUND));
    }

    public Product createProduct(ProductRequest request) {
        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stockQuantity(request.getStockQuantity())
                .category(request.getCategory())
                .hsnCode(request.getHsnCode())
                .taxRate(request.getTaxRate())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return productRepository.save(product);
    }

    public Product updateProduct(UUID id, ProductRequest request) {
        Product product = getProductById(id);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setCategory(request.getCategory());
        product.setHsnCode(request.getHsnCode());
        product.setTaxRate(request.getTaxRate());
        if (request.getIsActive() != null) {
            product.setIsActive(request.getIsActive());
        }
        return productRepository.save(product);
    }

    public void deleteProduct(UUID id) {
        Product product = getProductById(id);
        product.setIsActive(false); // soft delete
        productRepository.save(product);
    }

    public List<Product> getLowStockProducts(int threshold) {
        return productRepository.findByStockQuantityLessThanAndIsActiveTrue(threshold);
    }

    public void reduceStock(UUID productId, int quantity) {
        Product product = getProductById(productId);
        int newQty = product.getStockQuantity() - quantity;
        if (newQty < 0) newQty = 0;
        product.setStockQuantity(newQty);
        productRepository.save(product);
    }
}
