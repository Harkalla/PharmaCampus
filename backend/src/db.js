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

    CREATE TABLE IF NOT EXISTS semesters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      year INTEGER NOT NULL,
      sort_order INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id TEXT PRIMARY KEY,
      semester_id TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (semester_id) REFERENCES semesters(id)
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      semester TEXT NOT NULL,
      description TEXT,
      category TEXT,
      module_id TEXT,
      semester_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
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
      module_id TEXT,
      semester_id TEXT,
      semester TEXT,
      type TEXT,
      category TEXT DEFAULT 'Autre',
      author TEXT,
      file_name TEXT,
      file_path TEXT,
      file_url TEXT,
      file_size INTEGER,
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
      recipient_id TEXT,
      content TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      title TEXT,
      message TEXT,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_preferences (
      user_id TEXT PRIMARY KEY,
      notifications TEXT NOT NULL DEFAULT '{}',
      appearance TEXT NOT NULL DEFAULT 'dark',
      language TEXT NOT NULL DEFAULT 'fr',
      confirm_actions INTEGER DEFAULT 1,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
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
    ['reviewed_at', 'TEXT'], ['rejection_reason', 'TEXT'], ['module_id', 'TEXT'], ['semester_id', 'TEXT'], ['file_url', 'TEXT'], ['file_size', 'INTEGER']
  ];
  documentColumns.forEach(([name, definition]) => {
    try { db.exec(`ALTER TABLE documents ADD COLUMN ${name} ${definition}`); } catch (error) {
      if (!String(error.message).includes('duplicate column name')) throw error;
    }
  });

  try { db.exec('ALTER TABLE notifications ADD COLUMN is_read INTEGER DEFAULT 0'); } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }
  try { db.exec('ALTER TABLE messages ADD COLUMN recipient_id TEXT'); } catch (error) {
    if (!String(error.message).includes('duplicate column name')) throw error;
  }

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

    const semesterSeed = [
      ['S1', 1, 1], ['S2', 1, 2], ['S3', 2, 1], ['S4', 2, 2], ['S5', 3, 1], ['S6', 3, 2], ['S7', 4, 1], ['S8', 4, 2], ['S9', 5, 1], ['S10', 5, 2]
    ];
    semesterSeed.forEach(([name, year, sortOrder]) => {
      db.prepare('INSERT INTO semesters (id, name, year, sort_order) VALUES (?, ?, ?, ?)').run(name, name, year, sortOrder);
    });

    const moduleSeed = [
      ['S1', 'Math / Info', 'Base mathématique et informatique utile à la pharmacie.', 1],
      ['S1', 'Communication / Anglais', 'Langue et communication professionnelle.', 2],
      ['S1', 'Chimie', 'Fondements de la chimie générale.', 3],
      ['S1', 'Botanique', 'Étude des plantes et de leur organisation.', 4],
      ['S1', 'Biologie végétale', 'Morphologie et physiologie végétale.', 5],
      ['S1', 'Biologie cellulaire', 'Structure et fonctions cellulaires.', 6],
      ['S2', 'Anatomie', 'Étude de l’organisation anatomique du corps humain.', 1],
      ['S2', 'Langue Étrangère', 'Renforcement des compétences linguistiques.', 2],
      ['S2', 'Chimie Analytique I', 'Méthodes analytiques fondamentales.', 3],
      ['S2', 'Systématique Botanique', 'Classification des végétaux.', 4],
      ['S2', 'Histologie / Embryologie', 'Organisation cellulaire et développement embryonnaire.', 5],
      ['S2', 'Initiation à la Pharmacie', 'Découverte du métier pharmaceutique.', 6],
      ['S3', 'Biochimie structurale', 'Étude des biomolécules et de leur structure.', 1],
      ['S3', 'Chimie Analytique II', 'Techniques analytiques avancées.', 2],
      ['S3', 'Chimie Organique II', 'Réactions organiques et mécanismes.', 3],
      ['S3', 'Hématologie Biologique', 'Cellules sanguines et analyses biologiques.', 4],
      ['S3', 'Microbiologie', 'Bactérie, virus et pathogènes.', 5],
      ['S3', 'Physiologie Végétale', 'Fonctions essentielles des plantes.', 6],
      ['S4', 'Anglais pour la Pharmacie', 'Approche terminologique et communication.', 1],
      ['S4', 'Immunologie', 'Réponse immunitaire et protection de l’organisme.', 2],
      ['S4', 'Chimie Analytique Instrumentale', 'Instrumentations et méthodes avancées.', 3],
      ['S4', 'Bases de la Biotechnologie', 'Applications biotech et génie biologique.', 4],
      ['S4', 'Chimie Organique II', 'Synthèse et réactions organiques.', 5],
      ['S4', 'Pharmacologie Générale', 'Principes de la pharmacologie.', 6],
      ['S5', 'Médecine sociale et santé publique', 'Santé publique et prévention.', 1],
      ['S5', 'Essais Physicochimiques', 'Études des propriétés physicochimiques.', 2],
      ['S5', 'Biochimie Métabolique', 'Métabolisme intermédiaire et enzymes.', 3],
      ['S5', 'Microbiologie II / Immunologie', 'Microbiologie et défenses immunitaires.', 4],
      ['S5', 'Parasitologie', 'Parasites et maladies associées.', 5],
      ['S5', 'Pharmacie Galénique I', 'Préparation et formulation de médicaments.', 6],
      ['S5', 'Pharmacologie Spéciale I', 'Médicaments et leurs usages spécifiques.', 7],
      ['S6', 'Informatique et Systèmes d\'Aide', 'Outils numériques de gestion et aide à la décision.', 1],
      ['S6', 'Méthodes d\'Analyse', 'Méthodes de dosage et exploitation des résultats.', 2],
      ['S6', 'Pharmacie Hospitalière', 'Gestion des médicaments en hôpital.', 3],
      ['S6', 'Toxicologie', 'Étude des intoxications et mécanismes toxiques.', 4],
      ['S6', 'Chimie Thérapeutique I', 'Chimie des médicaments actifs.', 5],
      ['S6', 'Langues Étrangères', 'Communication scientifique internationale.', 6],
      ['S6', 'Pharmacognosie I', 'Plantes médicinales et principes actifs.', 7],
      ['S6', 'Pharmacie Galénique II', 'Formulations avancées et contrôle qualité.', 8],
      ['S7', 'Bromatologie - Hydrologie', 'Aliments, eau et contrôle qualité.', 1],
      ['S7', 'Chimie Thérapeutique II', 'Médicaments et développement thérapeutique.', 2],
      ['S7', 'Pharmacognosie spéciale et Essais', 'Études détaillées et essais des plantes médicinales.', 3],
      ['S7', 'Pharmacologie Spéciale II', 'Approfondissement pharmacologique.', 4],
      ['S7', 'Sémiologie Pathologique I', 'Manifestations pathologiques et signes cliniques.', 5],
      ['S7', 'Toxicologie II', 'Toxicologie clinique et environnementale.', 6],
      ['S8', 'Pharmacotechnie', 'Formulation et technologie pharmaceutique.', 1],
      ['S8', 'Biochimie Clinique', 'Biomarqueurs et analyses biochimiques cliniques.', 2],
      ['S8', 'Biochimie Pré-Instrumentale', 'Préparation et méthodes analytiques pré-analytique.', 3],
      ['S8', 'Sémiologie Pathologique II', 'Anatomie pathologique et signes sémiologiques.', 4],
      ['S8', 'Mycologie', 'Champignons pathogènes et leur étude.', 5],
      ['S8', 'Hématologie II', 'Hématologie approfondie.', 6],
      ['S9', 'Pharmacie clinique', 'Pharmacie de soins et suivi thérapeutique.', 1],
      ['S9', 'Méthodologie de recherche', 'Méthodes quantitatives et qualitatives.', 2],
      ['S9', 'Médicaments vétérinaires', 'Utilisation et sécurité des médicaments vétérinaires.', 3],
      ['S9', 'Hygiène', 'Prévention et hygiène de santé.', 4],
      ['S9', 'Droit pharmaceutique', 'Réglementation et cadre juridique.', 5],
      ['S9', 'Applications de biotechnologie', 'Biotechnologies appliquées à la santé.', 6],
      ['S10', 'Cosmétologie Médicale', 'Produits cosmétiques et soins de santé.', 1],
      ['S10', 'Pharmacie Industrielle', 'Industrie et production pharmaceutique.', 2],
      ['S10', 'Toxicologie d\'Urgence', 'Urgences toxiques et prise en charge.', 3],
      ['S10', 'Gestion Pharmaceutique', 'Gestion des médicaments et des structures.', 4],
      ['S10', 'Gestion de Projet / Management', 'Pilotage de projets et organisation.', 5],
      ['S10', 'Nutrition Diététique', 'Alimentation, nutrition et santé publique.', 6]
    ];

    moduleSeed.forEach(([semesterName, name, description, sortOrder]) => {
      const semester = db.prepare('SELECT id FROM semesters WHERE name = ?').get(semesterName);
      if (!semester) return;
      const moduleId = `${semesterName}-${name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18)}-${sortOrder}`;
      db.prepare('INSERT INTO modules (id, semester_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)').run(moduleId, semester.id, name, description, sortOrder);
      db.prepare('INSERT INTO subjects (id, name, semester, description, category, module_id, semester_id) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
        moduleId, name, semesterName, description, 'Module', moduleId, semester.id
      );
    });

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
      const exists = db.prepare('SELECT id FROM subjects WHERE id = ?').get(id);
      if (!exists) db.prepare('INSERT INTO subjects (id, name, semester, description, category) VALUES (?, ?, ?, ?, ?)').run(id, name, semester, description, category);
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

    db.prepare('INSERT INTO documents (id, title, description, subject_id, module_id, semester_id, semester, type, author, file_name, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'D1', 'Cours de pharmacologie S5', 'Support de cours complet sur les mécanismes d’action et les classes pharmacologiques.', 'M1', 'S5-Pharmacologie1', (db.prepare('SELECT id FROM semesters WHERE name = ?').get('S5')).id, 'S5', 'PDF', 'Dr. H. Amrani', 'cours-pharmacologie-s5.pdf', '/uploads/sample.pdf', new Date().toISOString()
    );

    db.prepare('INSERT INTO documents (id, title, description, subject_id, module_id, semester_id, semester, type, author, file_name, file_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'D2', 'Méthodes de dosage et dosage', 'Document pratique sur les méthodes de dosage et l’interprétation des résultats.', 'M2', 'S5-Chimie1', (db.prepare('SELECT id FROM semesters WHERE name = ?').get('S5')).id, 'S5', 'PDF', 'Pr. N. El Idrissi', 'dosage-pharmacie.pdf', '/uploads/sample.pdf', new Date().toISOString()
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
