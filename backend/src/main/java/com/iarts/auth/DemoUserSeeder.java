package com.iarts.auth;

import com.iarts.supplier.Supplier;
import com.iarts.supplier.SupplierRepository;
import com.iarts.user.User;
import com.iarts.user.UserRepository;
import com.iarts.user.UserRole;
import com.iarts.validation.DemoScanDataSeeder;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds the demo accounts shown on each portal's "help" credentials panel — same
 * password for all, so login is a real credential check instead of the old
 * pick-any-role dev-login. Presentation-only; keep in step with src/lib/demoAccounts.ts.
 *
 * Also links the school_admin account to DemoScanDataSeeder's DEMO_SCHOOL_ID (so
 * supply orders/reports/claims a school admin creates line up with the school that
 * actually has students/cards/scans seeded) and the supplier account to a real
 * Supplier row (so the supplier portal can look up "my" supply orders by supplierId).
 */
@Component
@RequiredArgsConstructor
@Profile("dev")
public class DemoUserSeeder implements ApplicationRunner {

    private static final String DEMO_PASSWORD = "Demo@1234";
    private static final String SUPPLIER_EMAIL = "supplier@shsdining.gh";
    private static final String SUPPLIER_NAME = "Golden Harvest";

    private record DemoAccount(String name, String email, UserRole role) {}

    private static final List<DemoAccount> ACCOUNTS = List.of(
            new DemoAccount("Essandoh Prince", "admin@shsdining.gh",     UserRole.SCHOOL_ADMIN),
            new DemoAccount("Kwabena Asante",  "regional@shsdining.gh",  UserRole.REGIONAL_OFFICER),
            new DemoAccount("Dr. Ama Boateng", "financial@shsdining.gh", UserRole.FINANCIAL_OFFICER),
            new DemoAccount("Yaw Owusu",       "audit@shsdining.gh",     UserRole.AUDIT_OFFICER),
            new DemoAccount(SUPPLIER_NAME,     SUPPLIER_EMAIL,           UserRole.SUPPLIER),
            new DemoAccount("Ghana Comm Bank", "bank@shsdining.gh",      UserRole.BANK)
    );

    private final UserRepository userRepository;
    private final SupplierRepository supplierRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        String hash = passwordEncoder.encode(DEMO_PASSWORD);

        Supplier supplier = supplierRepository.findAll().stream()
                .filter(s -> s.getContactEmail().equalsIgnoreCase(SUPPLIER_EMAIL))
                .findFirst()
                .orElseGet(Supplier::new);
        supplier.setName(SUPPLIER_NAME);
        supplier.setContactEmail(SUPPLIER_EMAIL);
        supplier = supplierRepository.save(supplier);

        for (DemoAccount acc : ACCOUNTS) {
            User user = userRepository.findByEmailIgnoreCase(acc.email()).orElseGet(User::new);
            user.setName(acc.name());
            user.setEmail(acc.email());
            user.setRole(acc.role());
            user.setPasswordHash(hash);
            if (acc.role() == UserRole.SCHOOL_ADMIN) user.setSchoolId(DemoScanDataSeeder.DEMO_SCHOOL_ID);
            if (acc.role() == UserRole.SUPPLIER) user.setSupplierId(supplier.getId());
            userRepository.save(user);
        }
    }
}
