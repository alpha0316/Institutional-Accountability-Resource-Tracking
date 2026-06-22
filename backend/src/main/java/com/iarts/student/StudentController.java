package com.iarts.student;

import com.iarts.common.ApiException;
import com.iarts.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentRepository studentRepository;

    @GetMapping
    public ApiResponse<List<StudentDto>> list() {
        return ApiResponse.of(studentRepository.findAll().stream().map(StudentDto::from).toList());
    }

    @GetMapping("/{id}")
    public ApiResponse<StudentDto> get(@PathVariable UUID id) {
        Student student = studentRepository.findById(id).orElseThrow(() -> ApiException.notFound("Student not found"));
        return ApiResponse.of(StudentDto.from(student));
    }

    @PostMapping
    public ApiResponse<StudentDto> create(@Valid @RequestBody StudentRequest req) {
        Student student = new Student();
        apply(student, req);
        return ApiResponse.of(StudentDto.from(studentRepository.save(student)), 201);
    }

    @PutMapping("/{id}")
    public ApiResponse<StudentDto> update(@PathVariable UUID id, @Valid @RequestBody StudentRequest req) {
        Student student = studentRepository.findById(id).orElseThrow(() -> ApiException.notFound("Student not found"));
        apply(student, req);
        return ApiResponse.of(StudentDto.from(studentRepository.save(student)));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        studentRepository.deleteById(id);
        return ApiResponse.of(null);
    }

    private void apply(Student student, StudentRequest req) {
        student.setUniqueCode(req.uniqueCode());
        student.setFullName(req.fullName());
        student.setEnrollmentStatus(req.enrollmentStatus() != null ? req.enrollmentStatus() : EnrollmentStatus.ACTIVE);
        student.setSchoolId(UUID.fromString(req.schoolId()));
        student.setYear(req.year());
        student.setDepartment(req.department());
    }
}
