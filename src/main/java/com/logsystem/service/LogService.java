package com.logsystem.service;

import com.logsystem.model.LogEntry;
import com.logsystem.repository.LogEntryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class LogService {
    private final LogEntryRepository logEntryRepository;

    public LogService(LogEntryRepository logEntryRepository) {
        this.logEntryRepository = logEntryRepository;
    }

    public Optional<LogEntry> createLog(Map<String, String> request) {
        String message = request == null ? null : request.get("message");
        if (!hasText(message)) {
            return Optional.empty();
        }

        return Optional.of(createLog(message));
    }

    public LogEntry createLog(String message) {
        LogEntry logEntry = new LogEntry(message);
        return logEntryRepository.save(logEntry);
    }

    public List<LogEntry> getAllLogs() {
        return logEntryRepository.findAll();
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
