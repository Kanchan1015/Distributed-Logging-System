package com.logsystem.repository;

import com.logsystem.model.LogEntry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LogEntryRepository extends MongoRepository<LogEntry, String> {
}
