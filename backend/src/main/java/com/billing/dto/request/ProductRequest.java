package com.billing.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private Integer stockQuantity = 0;

    private String category;

    private String hsnCode;

    @Min(value = 0, message = "Tax rate cannot be negative")
    @Max(value = 100, message = "Tax rate cannot exceed 100")
    private Double taxRate = 18.0;

    private Boolean isActive = true;
}
