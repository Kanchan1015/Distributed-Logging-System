package com.logsystem.controller;

import com.logsystem.model.LogEntry;
import com.logsystem.service.LogService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestDataController {
    private final LogService logService;

    public TestDataController(LogService logService) {
        this.logService = logService;
    }

    @PostMapping("/data")
    public ResponseEntity<LogEntry> addTestData(@RequestBody Map<String, String> request) {
        Optional<LogEntry> logEntry = logService.createLog(request);
        return logEntry.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.badRequest().build());
    }

    @GetMapping("/data")
    public ResponseEntity<List<LogEntry>> getTestData() {
        return ResponseEntity.ok(logService.getAllLogs());
    }
}
