package com.billing.service;

import com.billing.dto.request.BillRequest;
import com.billing.dto.response.DashboardStats;
import com.billing.entity.*;
import com.billing.exception.AppException;
import com.billing.repository.BillRepository;
import com.billing.repository.CustomerRepository;
import com.billing.repository.ProductRepository;
import com.billing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional
    public Bill createBill(BillRequest request) {
        // Identify logged-in user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Resolve customer (optional)
        Customer customer = null;
        if (request.getCustomerId() != null) {
            customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new AppException("Customer not found", HttpStatus.NOT_FOUND));
        }

        // Build line items
        List<BillItem> items = new ArrayList<>();
        double subtotal = 0;
        double totalTax = 0;

        for (BillRequest.BillItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new AppException("Product not found: " + itemReq.getProductId(), HttpStatus.NOT_FOUND));

            double unitPrice = (itemReq.getUnitPrice() != null) ? itemReq.getUnitPrice() : product.getPrice();
            double taxRate = product.getTaxRate();
            double lineSubtotal = unitPrice * itemReq.getQuantity();
            double taxAmount = lineSubtotal * taxRate / 100.0;
            double lineTotal = lineSubtotal + taxAmount;

            BillItem item = BillItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .hsnCode(product.getHsnCode())
                    .quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice)
                    .taxRate(taxRate)
                    .taxAmount(round(taxAmount))
                    .totalPrice(round(lineTotal))
                    .build();

            items.add(item);
            subtotal += lineSubtotal;
            totalTax += taxAmount;

            // Reduce stock
            productService.reduceStock(product.getId(), itemReq.getQuantity());
        }

        double discount = request.getDiscount() != null ? request.getDiscount() : 0.0;
        double discountedSubtotal = subtotal - discount;
        double finalTotal = discountedSubtotal + totalTax;

        // GST split
        double cgst = 0, sgst = 0, igst = 0;
        String gstType = request.getGstType() != null ? request.getGstType() : "CGST_SGST";
        if ("IGST".equals(gstType)) {
            igst = totalTax;
        } else {
            cgst = totalTax / 2;
            sgst = totalTax / 2;
        }

        Bill bill = Bill.builder()
                .billNumber(generateBillNumber())
                .customer(customer)
                .createdBy(user)
                .subtotal(round(subtotal))
                .discount(round(discount))
                .cgstAmount(round(cgst))
                .sgstAmount(round(sgst))
                .igstAmount(round(igst))
                .totalTax(round(totalTax))
                .totalAmount(round(finalTotal))
                .paymentMethod(request.getPaymentMethod())
                .gstType(gstType)
                .notes(request.getNotes())
                .status("PAID")
                .build();

        // Link items to bill
        for (BillItem item : items) {
            item.setBill(bill);
        }
        bill.setItems(items);

        return billRepository.save(bill);
    }

    public List<Bill> getAllBills() {
        return billRepository.findAllByOrderByCreatedAtDesc();
    }

    public Bill getBillById(UUID id) {
        return billRepository.findById(id)
                .orElseThrow(() -> new AppException("Bill not found", HttpStatus.NOT_FOUND));
    }

    public DashboardStats getDashboardStats() {
        return DashboardStats.builder()
                .totalRevenue(nullSafe(billRepository.getTotalRevenue()))
                .todayRevenue(nullSafe(billRepository.getTodayRevenue()))
                .monthlyRevenue(nullSafe(billRepository.getMonthlyRevenue()))
                .todayBills(billRepository.getTodayBillCount())
                .totalProducts(productRepository.countByIsActiveTrue())
                .lowStockProducts((long) productRepository.findByStockQuantityLessThanAndIsActiveTrue(5).size())
                .totalCustomers(customerRepository.count())
                .recentBills(billRepository.findTop5ByOrderByCreatedAtDesc())
                .build();
    }

    private String generateBillNumber() {
        String prefix = "INV-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        long count = billRepository.count() + 1;
        return prefix + String.format("%04d", count);
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private double nullSafe(Double value) {
        return value != null ? value : 0.0;
    }
}
