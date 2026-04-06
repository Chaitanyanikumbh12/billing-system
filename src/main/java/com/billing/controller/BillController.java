package com.billing.controller;

import com.billing.model.Bill;
import com.billing.model.BillItem;
import com.billing.model.Product;
import com.billing.repository.BillRepository;
import com.billing.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    @Autowired
    private BillRepository billRepository;

    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByIdDesc();
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> saveBill(@RequestBody Bill bill) {
        if (bill.getCustomerName() == null || bill.getItems() == null || bill.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Customer name and items required"));
        }

        // Link each item back to the bill and deduct stock
        for (BillItem item : bill.getItems()) {
            item.setBill(bill);

            // Deduct stock from matching product
            List<Product> products = productRepository.findAll();
            Optional<Product> match = products.stream()
                .filter(p -> p.getProductName().equalsIgnoreCase(item.getName()))
                .findFirst();

            if (match.isPresent()) {
                Product p = match.get();
                int newStock = p.getStock() - item.getQty();
                if (newStock < 0) {
                    return ResponseEntity.badRequest().body(Map.of(
                        "status", "error",
                        "message", "Not enough stock for: " + item.getName()
                    ));
                }
                p.setStock(newStock);
                productRepository.save(p);
            }
        }

        billRepository.save(bill);
        return ResponseEntity.ok(Map.of("status", "success"));
    }
}
