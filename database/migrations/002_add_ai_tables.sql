-- AI Suggestions Table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    error_message TEXT,
    suggestion TEXT NOT NULL,
    confidence REAL DEFAULT 0.5,
    used_count INTEGER DEFAULT 0,
    feedback_score INTEGER, -- 1-5 rating from user
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX idx_ai_suggestions_timestamp ON ai_suggestions(timestamp DESC);
CREATE INDEX idx_ai_suggestions_used ON ai_suggestions(used_count DESC);

-- Command Context Table
CREATE TABLE IF NOT EXISTS command_context (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command TEXT NOT NULL,
    directory TEXT,
    platform TEXT,
    previous_command TEXT,
    exit_code INTEGER,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI Training Data Table
CREATE TABLE IF NOT EXISTS ai_training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    input_text TEXT NOT NULL,
    output_text TEXT NOT NULL,
    command_type TEXT,
    success BOOLEAN DEFAULT 0,
    user_rating INTEGER,
    used_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Popular Commands Cache
CREATE TABLE IF NOT EXISTS popular_commands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    command_pattern TEXT NOT NULL UNIQUE,
    category TEXT,
    frequency INTEGER DEFAULT 1,
    last_used DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Update popular commands on command execution
CREATE TRIGGER update_popular_commands
AFTER INSERT ON command_logs
BEGIN
    INSERT INTO popular_commands (command_pattern, frequency)
    VALUES (NEW.command, 1)
    ON CONFLICT(command_pattern) DO UPDATE SET
        frequency = frequency + 1,
        last_used = CURRENT_TIMESTAMP;
END;