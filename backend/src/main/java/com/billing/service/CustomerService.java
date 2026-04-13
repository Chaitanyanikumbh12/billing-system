package com.billing.service;

import com.billing.dto.request.CustomerRequest;
import com.billing.entity.Customer;
import com.billing.exception.AppException;
import com.billing.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAllByOrderByNameAsc();
    }

    public List<Customer> searchCustomers(String query) {
        return customerRepository.searchCustomers(query);
    }

    public Customer getCustomerById(UUID id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new AppException("Customer not found", HttpStatus.NOT_FOUND));
    }

    public Customer createCustomer(CustomerRequest request) {
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .address(request.getAddress())
                .gstNumber(request.getGstNumber())
                .build();
        return customerRepository.save(customer);
    }

    public Customer updateCustomer(UUID id, CustomerRequest request) {
        Customer customer = getCustomerById(id);
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setGstNumber(request.getGstNumber());
        return customerRepository.save(customer);
    }

    public void deleteCustomer(UUID id) {
        customerRepository.findById(id)
                .orElseThrow(() -> new AppException("Customer not found", HttpStatus.NOT_FOUND));
        customerRepository.deleteById(id);
    }

    public long getTotalCount() {
        return customerRepository.count();
    }
}
