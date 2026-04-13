package com.billing.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BillRequest {

    private UUID customerId;

    @NotEmpty(message = "Bill must have at least one item")
    private List<BillItemRequest> items;

    private Double discount = 0.0;

    private String paymentMethod = "CASH";

    private String gstType = "CGST_SGST";

    private String notes;

    @Data
    public static class BillItemRequest {

        @NotNull(message = "Product ID is required")
        private UUID productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;

        // Allow frontend to override unit price (e.g. manual entry)
        @Positive(message = "Unit price must be positive")
        private Double unitPrice;
    }
}
