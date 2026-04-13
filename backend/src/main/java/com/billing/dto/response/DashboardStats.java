package com.billing.dto.response;

import com.billing.entity.Bill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private Double totalRevenue;
    private Double todayRevenue;
    private Double monthlyRevenue;
    private Long todayBills;
    private Long totalProducts;
    private Long lowStockProducts;
    private Long totalCustomers;
    private List<Bill> recentBills;
}
