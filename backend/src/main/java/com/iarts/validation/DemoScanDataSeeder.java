package com.iarts.validation;

import com.iarts.student.Card;
import com.iarts.student.CardRepository;
import com.iarts.student.EnrollmentStatus;
import com.iarts.student.Student;
import com.iarts.student.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Mirrors the frontend's MOCK_STUDENTS (src/lib/mockData.ts) into real Postgres rows,
 * using each student's uniqueCode (their student ID) as their card's QR code — the
 * physical printed cards encode the student ID directly, there's no separate card-UID
 * concept in this school's actual cards. So any student shown in the (still
 * mock-data-driven) Student Registry / Card Management UI can actually be scanned live
 * at the kiosk and show up correctly on the Dining Hall Feed. Keep in sync with
 * mockData.ts if that roster changes.
 */
@Component
@RequiredArgsConstructor
@Profile("dev")
public class DemoScanDataSeeder implements ApplicationRunner {

    /** Fixed so re-runs are idempotent and attendance queries stay consistent. */
    public static final UUID DEMO_SCHOOL_ID = UUID.fromString("00000000-0000-0000-0000-000000000001");

    private record DemoStudent(String uniqueCode, String fullName, int year, String department) {}

    private static final List<DemoStudent> STUDENTS = List.of(
            new DemoStudent("SAC-2026-01482", "Essandoh Prince", 3, "General Science"),
            new DemoStudent("SAC-2026-01483", "Abena Serwaa",    2, "General Arts"),
            new DemoStudent("SAC-2026-01484", "Kofi Mensah",     1, "Home Economics"),
            new DemoStudent("SAC-2026-01485", "Ama Adobea",      3, "Business"),
            new DemoStudent("SAC-2026-01486", "Yaw Boateng",     2, "General Science"),
            new DemoStudent("SAC-2026-01487", "Akua Danso",      1, "Visual Arts"),
            new DemoStudent("SAC-2026-01488", "Kwame Asante",    3, "Agricultural Science"),
            new DemoStudent("SAC-2026-01489", "Efua Donkor",     2, "General Science"),
            new DemoStudent("SAC-2026-01490", "Nana Yaw",        1, "General Science"),
            new DemoStudent("SAC-2026-01491", "Adwoa Poku",      3, "Home Economics")
    );

    private final StudentRepository studentRepository;
    private final CardRepository cardRepository;

    @Override
    public void run(ApplicationArguments args) {
        for (DemoStudent d : STUDENTS) {
            Student student = studentRepository.findAll().stream()
                    .filter(s -> s.getUniqueCode().equals(d.uniqueCode()))
                    .findFirst()
                    .orElseGet(Student::new);
            student.setUniqueCode(d.uniqueCode());
            student.setFullName(d.fullName());
            student.setEnrollmentStatus(EnrollmentStatus.ACTIVE);
            student.setSchoolId(DEMO_SCHOOL_ID);
            student.setYear(d.year());
            student.setDepartment(d.department());
            student = studentRepository.save(student);

            Card card = cardRepository.findByQrCode(d.uniqueCode()).orElseGet(Card::new);
            card.setStudentId(student.getId());
            card.setCardNumber(d.uniqueCode());
            card.setQrCode(d.uniqueCode());
            card.setActive(true);
            cardRepository.save(card);
        }
    }
}
