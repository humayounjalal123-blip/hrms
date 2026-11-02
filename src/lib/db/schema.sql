CREATE DATABASE IF NOT EXISTS hrms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hrms;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS meeting_students;
DROP TABLE IF EXISTS meetings;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS revisions;
DROP TABLE IF EXISTS memorization;
DROP TABLE IF EXISTS contact_messages;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS classes;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE classes (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  category ENUM('nazira', 'hifz', 'murajah', 'intensive') NOT NULL,
  teacher_id VARCHAR(64) NULL,
  max_students INT NOT NULL DEFAULT 50,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_classes_name (name)
) ENGINE=InnoDB;

CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL,
  phone VARCHAR(64) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  avatar VARCHAR(512) NULL,
  teacher_id VARCHAR(64) NULL,
  class_id VARCHAR(64) NULL,
  class_name VARCHAR(191) NULL,
  created_at VARCHAR(40) NOT NULL,
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_class (class_id),
  CONSTRAINT fk_users_class FOREIGN KEY (class_id) REFERENCES classes (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

ALTER TABLE classes
  ADD CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES users (id)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE memorization (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  surah VARCHAR(128) NOT NULL,
  ayah_from INT NOT NULL,
  ayah_to INT NOT NULL,
  date_value VARCHAR(40) NOT NULL,
  recorded_by VARCHAR(64) NOT NULL,
  notes TEXT NULL,
  KEY idx_mem_student (student_id),
  CONSTRAINT fk_mem_student FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE revisions (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  surah VARCHAR(128) NOT NULL,
  ayah_from INT NOT NULL,
  ayah_to INT NOT NULL,
  due_date VARCHAR(40) NOT NULL,
  status ENUM('pending', 'completed', 'upcoming', 'overdue') NOT NULL,
  assigned_by VARCHAR(64) NOT NULL,
  completed_at VARCHAR(40) NULL,
  notes TEXT NULL,
  KEY idx_rev_student (student_id),
  CONSTRAINT fk_rev_student FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE assessments (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  teacher_id VARCHAR(64) NOT NULL,
  surah VARCHAR(128) NOT NULL,
  ayah_from INT NOT NULL,
  ayah_to INT NOT NULL,
  score INT NOT NULL,
  grade VARCHAR(16) NOT NULL,
  mistakes TEXT NOT NULL,
  feedback TEXT NOT NULL,
  date_value VARCHAR(40) NOT NULL,
  KEY idx_assess_student (student_id),
  CONSTRAINT fk_assess_student FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_assess_teacher FOREIGN KEY (teacher_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE contact_messages (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at VARCHAR(40) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE meetings (
  id VARCHAR(64) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  host_id VARCHAR(64) NOT NULL,
  class_id VARCHAR(64) NULL,
  provider ENUM('jitsi', 'zoom', 'google_meet') NOT NULL,
  room_code VARCHAR(128) NOT NULL,
  external_url VARCHAR(512) NULL,
  scheduled_at VARCHAR(40) NOT NULL,
  duration_mins INT NOT NULL DEFAULT 45,
  for_international TINYINT(1) NOT NULL DEFAULT 0,
  status ENUM('scheduled', 'live', 'ended') NOT NULL DEFAULT 'scheduled',
  created_at VARCHAR(40) NOT NULL,
  KEY idx_meetings_host (host_id),
  CONSTRAINT fk_meetings_host FOREIGN KEY (host_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_meetings_class FOREIGN KEY (class_id) REFERENCES classes (id)
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE meeting_students (
  meeting_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  PRIMARY KEY (meeting_id, student_id),
  CONSTRAINT fk_ms_meeting FOREIGN KEY (meeting_id) REFERENCES meetings (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_ms_student FOREIGN KEY (student_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;
