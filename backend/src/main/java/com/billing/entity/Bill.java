package com.billing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "bills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "bill_number", unique = true, nullable = false)
    private String billNumber;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User createdBy;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @Builder.Default
    private List<BillItem> items = new ArrayList<>();

    @Column(nullable = false)
    private Double subtotal;

    @Builder.Default
    private Double discount = 0.0;

    @Column(name = "cgst_amount")
    @Builder.Default
    private Double cgstAmount = 0.0;

    @Column(name = "sgst_amount")
    @Builder.Default
    private Double sgstAmount = 0.0;

    @Column(name = "igst_amount")
    @Builder.Default
    private Double igstAmount = 0.0;

    @Column(name = "total_tax")
    @Builder.Default
    private Double totalTax = 0.0;

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "payment_method")
    @Builder.Default
    private String paymentMethod = "CASH";

    @Builder.Default
    private String status = "PAID";

    @Column(name = "gst_type")
    @Builder.Default
    private String gstType = "CGST_SGST";

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
