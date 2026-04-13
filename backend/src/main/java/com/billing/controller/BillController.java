package com.billing.controller;

import com.billing.dto.request.BillRequest;
import com.billing.dto.response.ApiResponse;
import com.billing.dto.response.DashboardStats;
import com.billing.entity.Bill;
import com.billing.service.BillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping
    public ResponseEntity<ApiResponse<Bill>> createBill(@Valid @RequestBody BillRequest request) {
        Bill bill = billService.createBill(request);
        return ResponseEntity.ok(ApiResponse.success("Bill created successfully", bill));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Bill>>> getAllBills() {
        return ResponseEntity.ok(ApiResponse.success(billService.getAllBills()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Bill>> getBillById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(billService.getBillById(id)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(billService.getDashboardStats()));
    }
}
