const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'pharmacampus.db'));
db.pragma('journal_mode = WAL');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      country TEXT,
      city TEXT,
      university TEXT,
      level TEXT,
      semester TEXT,
      bio TEXT,
      photo_url TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      semester TEXT NOT NULL,
      description TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      subject_id TEXT,
      semester TEXT,
      level TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      subject_id TEXT,
      semester TEXT,
      type TEXT,
      category TEXT DEFAULT 'Autre',
      author TEXT,
      file_name TEXT,
      file_path TEXT,
      status TEXT DEFAULT 'published',
      submitted_by TEXT,
      year INTEGER,
      tags TEXT,
      cover_image TEXT,
      reviewed_by TEXT,
      reviewed_at TEXT,
      rejection_reason TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exams (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject_id TEXT,
      semester TEXT,
      year INTEGER,
      file_name TEXT,
      file_path TEXT,
      answer_file_name TEXT,
      answer_file_path TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject_id TEXT,
      semester TEXT,
      questions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      quiz_id TEXT,
      score INTEGER,
      total INTEGER,
      submitted_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS medicines (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      dci TEXT,
      therapeutic_class TEXT,
      indications TEXT,
      dosage TEXT,
      contraindications TEXT,
      adverse_effects TEXT,
      precautions TEXT,
      interactions TEXT,
      forms TEXT,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      content TEXT,
      subject_id TEXT,
      category TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS answers (
      id TEXT PRIMARY KEY,
      question_id TEXT,
      user_id TEXT,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      room TEXT,
      user_id TEXT,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      message TEXT,
      link TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      type TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS suggestions (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const documentColumns = [
    ['category', "TEXT DEFAULT 'Autre'"], ['status', "TEXT DEFAULT 'published'"], ['submitted_by', 'TEXT'], ['year', 'INTEGER'],
    ['tags', 'TEXT'], ['cover_image', 'TEXT'], ['reviewed_by', 'TEXT'],
    ['reviewed_at', 'TEXT'], ['rejection_reason', 'TEXT']
  ];
  documentColumns.forEach(([name, definition]) => {
    try { db.exec(`ALTER TABLE documents ADD COLUMN ${name} ${definition}`); } catch (error) {
      if (!String(error.message).includes('duplicate column name')) throw error;
    }
  });

  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const studentHash = bcrypt.hashSync('student123', 10);

    db.prepare(`INSERT INTO users (id, first_name, last_name, email, password_hash, role, country, city, university, level, semester, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'admin-1', 'Admin', 'Pharma', 'admin@pharmacampus.com', passwordHash, 'admin', 'Maroc', 'Casablanca', 'Université Hassan II', 'Doctorat', 'S10', 'Administrateur principal de la plateforme.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    );

    db.prepare(`INSERT INTO users (id, first_name, last_name, email, password_hash, role, country, city, university, level, semester, bio, photo_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      'user-1', 'Salma', 'Bensaid', 'student@pharmacampus.com', studentHash, 'user', 'Maroc', 'Rabat', 'Faculté de Médecine', 'Licence', 'S5', 'Étudiante en pharmacie, motivée par la pharmacologie et les examens pratiques.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
    );

    const semesters = ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10'];
    const subjects = [
      ['M1', 'Pharmacologie', 'S5', 'Étude des médicaments et de leurs mécanismes d’action.', 'Pharmacologie'],
      ['M2', 'Chimie', 'S5', 'Bases de la chimie pharmaceutique et analytique.', 'Chimie'],
      ['M3', 'Microbiologie', 'S6', 'Bactéries, virus et antibiotiques.', 'Microbiologie'],
      ['M4', 'Galénique', 'S4', 'Formes pharmaceutiques et fabrication des médicaments.', 'Galénique'],
      ['M5', 'Biochimie', 'S3', 'Métabolisme et biomolécules.', 'Biochimie'],
      ['M6', 'Toxicologie', 'S8', 'Effets délétères des substances et prévention.', 'Toxicologie'],
      ['M7', 'Pharmacognosie', 'S7', 'Médicaments d’origine naturelle.', 'Pharmacognosie'],
      ['M8', 'Pharmacie hospitalière', 'S9', 'Gestion des médicaments en structure hospitalière.', 'Pharmacie hospitalière']
    ];

    subjects.forEach(([id, name, semester, description, category]) => {
      db.prepare('INSERT INTO subjects (id, name, semester, description, category) VALUES (?, ?, ?, ?, ?)').run(id, name, semester, description, category);
    });

    const courseList = [
      ['C1', 'Introduction à la pharmacologie clinique', 'Pharmacologie', 'S5', 'Licence'],
      ['C2', 'Chimie analytique appliquée', 'Chimie', 'S5', 'Licence'],
      ['C3', 'Antibiotiques et résistance bactérienne', 'Microbiologie', 'S6', 'Licence'],
      ['C4', 'Formes galéniques et stabilité', 'Galénique', 'S4', 'Licence']
    ];
    courseList.forEach(([id, title, subjectName, semester, level]) => {
      const subject = db.prepare('SELECT id FROM subjects WHERE name = ? AND semester = ?').get(subjectName, semester);
      if (subject) {
        db.prepare('INSERT INTO courses (id, title, description, subject_id, semester, level) VALUES (?, ?, ?, ?, ?, ?)').run(id, title, `Cours de ${subjectName} pour la préparation d’examens et de révisions pédagogiques.`, subject.id, semester, level);
      }
    });

    db.prepare('INSERT INTO documents (id, title, description, subject_id, semester, type, author, file_name, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'D1', 'Cours de pharmacologie S5', 'Support de cours complet sur les mécanismes d’action et les classes pharmacologiques.', 'M1', 'S5', 'PDF', 'Dr. H. Amrani', 'cours-pharmacologie-s5.pdf', '/uploads/sample.pdf', new Date().toISOString()
    );

    db.prepare('INSERT INTO documents (id, title, description, subject_id, semester, type, author, file_name, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'D2', 'Méthodes de dosage et dosage', 'Document pratique sur les méthodes de dosage et l’interprétation des résultats.', 'M2', 'S5', 'PDF', 'Pr. N. El Idrissi', 'dosage-pharmacie.pdf', '/uploads/sample.pdf', new Date().toISOString()
    );

    db.prepare('INSERT INTO exams (id, title, subject_id, semester, year, file_name, file_path, answer_file_name, answer_file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'E1', 'Examen de pharmacologie S5', 'M1', 'S5', 2025, 'exam-pharma-s5.pdf', '/uploads/sample.pdf', 'corrige-pharma-s5.pdf', '/uploads/sample.pdf', new Date().toISOString()
    );

    const quizQuestions = JSON.stringify([
      {
        id: 'Q1',
        question: 'Quel mécanisme d’action est associé aux bêta-bloquants ?',
        options: ['Blocage des récepteurs β-adrénergiques', 'Inhibition de la cyclooxygénase', 'Blocage des canaux sodiques', 'Activation des récepteurs muscariniques'],
        correctAnswers: ['Blocage des récepteurs β-adrénergiques'],
        explanation: 'Les bêta-bloquants se fixent sur les récepteurs β-adrénergiques pour diminuer l’effet sympathique.'
      },
      {
        id: 'Q2',
        question: 'La pharmacocinétique inclut principalement :',
        options: ['Absorption, distribution, métabolisme et élimination', 'Seule la toxicité', 'Le dosage des prix de vente', 'La fabrication des comprimés'],
        correctAnswers: ['Absorption, distribution, métabolisme et élimination'],
        explanation: 'Ce sont les quatre principales étapes du devenir d’un médicament dans l’organisme.'
      }
    ]);

    db.prepare('INSERT INTO quizzes (id, title, subject_id, semester, questions) VALUES (?, ?, ?, ?, ?)').run('QZ1', 'Quiz de révision Pharmacologie', 'M1', 'S5', quizQuestions);

    db.prepare('INSERT INTO medicines (id, name, dci, therapeutic_class, indications, dosage, contraindications, adverse_effects, precautions, interactions, forms, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'MED1', 'Paracétamol', 'Paracétamol', 'Antalgique / antipyrétique', 'Fièvre et douleurs bénignes.', '500 à 1000 mg toutes les 6 heures, selon l’âge et le poids.', 'Insuffisance hépatique sévère.', 'Très rare : hépatotoxicité en cas de surdosage.', 'Respecter la dose maximale quotidienne.', 'Potentialisation des effets hépatotoxiques avec alcool', 'Comprimés, sirop, suppositoires', 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80'
    );

    db.prepare('INSERT INTO medicines (id, name, dci, therapeutic_class, indications, dosage, contraindications, adverse_effects, precautions, interactions, forms, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'MED2', 'Amoxicilline', 'Amoxicilline', 'Antibiotique bêta-lactamine', 'Infections bactériennes diverses.', '500 mg à 1 g toutes les 8 à 12 heures.', 'Allergie aux pénicillines.', 'Troubles digestifs, rash, diarrhée.', 'Ajuster la dose en cas d’insuffisance rénale.', 'Diminution d’efficacité avec certains antacides.', 'Comprimés, suspension, poudre', 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=500&q=80'
    );

    db.prepare('INSERT INTO questions (id, user_id, title, content, subject_id, category, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
      'QUE1', 'user-1', 'Différence entre pharmacocinétique et pharmacodynamie ?', 'Je n’arrive pas à bien distinguer ces deux notions. Merci pour votre aide.', 'M1', 'Pharmacologie', new Date().toISOString()
    );

    db.prepare('INSERT INTO answers (id, question_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)').run(
      'ANS1', 'QUE1', 'admin-1', 'La pharmacocinétique décrit le devenir du médicament dans l’organisme. La pharmacodynamie décrit son effet sur l’organisme.', new Date().toISOString()
    );

    db.prepare('INSERT INTO messages (id, room, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)').run('MSG1', 'general', 'user-1', 'Bonjour à tous, qui peut m’expliquer la différence entre agoniste partiel et agoniste complet ?', new Date().toISOString());
    db.prepare('INSERT INTO notifications (id, user_id, title, message, link, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('NOT1', 'user-1', 'Nouveau document', 'Un nouveau support de cours a été ajouté en pharmacologie.', '/documents', new Date().toISOString());
    db.prepare('INSERT INTO notifications (id, user_id, title, message, link, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('NOT2', 'user-1', 'Nouvelle réponse', 'Votre question sur la pharmacocinétique a reçu une réponse utile.', '/entraide', new Date().toISOString());
    db.prepare('INSERT INTO reports (id, user_id, type, description, created_at) VALUES (?, ?, ?, ?, ?)').run('REP1', 'user-1', 'erreur', 'Une erreur de formulation a été constatée dans le cours de pharmacologie.', new Date().toISOString());
    db.prepare('INSERT INTO suggestions (id, user_id, title, description, created_at) VALUES (?, ?, ?, ?, ?)').run('SUG1', 'user-1', 'Ajouter un espace de révision par matière', 'Une section dédiée aux fiches de révision par matière serait très utile.', new Date().toISOString());
  }
}

module.exports = { db, initializeDatabase };
