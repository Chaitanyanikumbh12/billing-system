package com.billing.repository;

import com.billing.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    List<Bill> findAllByOrderByCreatedAtDesc();

    List<Bill> findTop5ByOrderByCreatedAtDesc();

    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM bills", nativeQuery = true)
    Double getTotalRevenue();

    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM bills WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    Double getTodayRevenue();

    @Query(value = "SELECT COALESCE(SUM(total_amount), 0) FROM bills " +
                   "WHERE EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) " +
                   "AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)", nativeQuery = true)
    Double getMonthlyRevenue();

    @Query(value = "SELECT COUNT(*) FROM bills WHERE DATE(created_at) = CURRENT_DATE", nativeQuery = true)
    Long getTodayBillCount();

    @Query(value = "SELECT COUNT(*) FROM bills WHERE status = ?1", nativeQuery = true)
    Long countByStatus(String status);
}
