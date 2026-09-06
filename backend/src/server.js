const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { db, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'pharmacampus-secret-key';
const uploadDir = path.join(__dirname, '..', 'uploads');

initializeDatabase();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});
const upload = multer({ storage });
const profileUpload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype));
} });

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token manquant ou invalide.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'Utilisateur introuvable.' });
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session invalide.' });
  }
}

function adminMiddleware(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé à l’administrateur.' });
  }
  next();
}

function sanitizeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'PharmaCampus API is running' });
});

app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, password, country, city, university, level, semester, bio, photoUrl } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ error: 'Informations de base manquantes.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Adresse email invalide.' });
  }
  if (!/^[A-Za-z0-9]{6,8}$/.test(password) || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir 6 à 8 caractères, uniquement des lettres et chiffres, avec au moins une lettre et un chiffre.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse email.' });
  }

  const id = uuidv4();
  const passwordHash = await bcrypt.hash(password, 10);
  const user = db.prepare(`
    INSERT INTO users (id, first_name, last_name, email, password_hash, role, country, city, university, level, semester, bio, photo_url)
    VALUES (?, ?, ?, ?, ?, 'user', ?, ?, ?, ?, ?, ?, ?)
  `).run(id, firstName, lastName, email.toLowerCase(), passwordHash, country || '', city || '', university || '', level || '', semester || '', bio || '', photoUrl || '');

  const createdUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = signToken(createdUser);
  res.status(201).json({ token, user: sanitizeUser(createdUser) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get((email || '').toLowerCase());
  if (!user) return res.status(401).json({ error: 'Identifiants invalides.' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Identifiants invalides.' });

  const token = signToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

app.get('/api/preferences', authMiddleware, (req, res) => {
  const preferences = db.prepare('SELECT * FROM user_preferences WHERE user_id = ?').get(req.user.id) || {
    user_id: req.user.id, notifications: '{}', appearance: 'dark', language: 'fr', confirm_actions: 1
  };
  res.json({ ...preferences, notifications: JSON.parse(preferences.notifications || '{}') });
});

app.put('/api/preferences', authMiddleware, (req, res) => {
  const { notifications = {}, appearance = 'dark', language = 'fr', confirmActions = true } = req.body;
  if (!['dark', 'light', 'system'].includes(appearance) || !['fr', 'en'].includes(language)) return res.status(400).json({ error: 'Préférence invalide.' });
  db.prepare(`INSERT INTO user_preferences (user_id, notifications, appearance, language, confirm_actions, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id) DO UPDATE SET notifications = excluded.notifications, appearance = excluded.appearance, language = excluded.language, confirm_actions = excluded.confirm_actions, updated_at = CURRENT_TIMESTAMP`)
    .run(req.user.id, JSON.stringify(notifications), appearance, language, confirmActions ? 1 : 0);
  res.json({ message: 'Préférences enregistrées.' });
});

app.patch('/api/profile', authMiddleware, profileUpload.single('photo'), (req, res) => {
  const { firstName, lastName, country, city, university, level, semester, bio, removePhoto } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: 'Nom et prénom requis.' });
  const photoUrl = removePhoto === 'true' ? '' : req.file ? `/uploads/${req.file.filename}` : req.user.photo_url || '';
  db.prepare('UPDATE users SET first_name = ?, last_name = ?, country = ?, city = ?, university = ?, level = ?, semester = ?, bio = ?, photo_url = ? WHERE id = ?')
    .run(firstName, lastName, country || '', city || '', university || '', level || '', semester || '', bio || '', photoUrl, req.user.id);
  res.json({ user: sanitizeUser(db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id)), message: 'Profil mis à jour avec succès.' });
});

app.post('/api/profile/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !/^[A-Za-z0-9]{6,8}$/.test(newPassword || '') || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir 6 à 8 caractères, uniquement des lettres et chiffres, avec une lettre et un chiffre.' });
  }
  if (!await bcrypt.compare(currentPassword, req.user.password_hash)) return res.status(400).json({ error: 'Mot de passe actuel incorrect.' });
  const passwordHash = await bcrypt.hash(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, req.user.id);
  res.json({ message: 'Mot de passe modifié avec succès.' });
});

app.get('/api/semesters', (req, res) => {
  const semesters = Array.from({ length: 10 }, (_, index) => `S${index + 1}`);
  const subjects = db.prepare('SELECT * FROM subjects ORDER BY semester, name').all();

  const grouped = semesters.map((semester) => ({
    id: semester,
    name: semester,
    subjects: subjects.filter((item) => item.semester === semester)
  }));

  res.json({ semesters: grouped });
});

app.get('/api/subjects', (req, res) => {
  const { semester } = req.query;
  const query = semester ? 'SELECT * FROM subjects WHERE semester = ? ORDER BY name' : 'SELECT * FROM subjects ORDER BY semester, name';
  const rows = semester ? db.prepare(query).all(semester) : db.prepare(query).all();
  res.json({ subjects: rows });
});

app.get('/api/subject/:subjectId', (req, res) => {
  const subject = db.prepare('SELECT * FROM subjects WHERE id = ?').get(req.params.subjectId);
  if (!subject) return res.status(404).json({ error: 'Matière introuvable.' });

  const courses = db.prepare('SELECT * FROM courses WHERE subject_id = ?').all(subject.id);
  const documents = db.prepare("SELECT * FROM documents WHERE subject_id = ? AND COALESCE(status, 'published') = 'published'").all(subject.id);
  const exams = db.prepare('SELECT * FROM exams WHERE subject_id = ?').all(subject.id);
  const quiz = db.prepare('SELECT * FROM quizzes WHERE subject_id = ?').all(subject.id);

  res.json({ subject, courses, documents, exams, quizzes: quiz });
});

app.get('/api/courses', (req, res) => {
  const course = db.prepare('SELECT * FROM courses ORDER BY created_at DESC').all();
  res.json({ courses: course });
});

app.get('/api/documents', (req, res) => {
  const { q, subjectId } = req.query;
  let rows = db.prepare("SELECT * FROM documents WHERE COALESCE(status, 'published') = 'published' ORDER BY created_at DESC").all();
  if (subjectId) rows = rows.filter((row) => row.subject_id === subjectId);
  if (q) rows = rows.filter((row) => `${row.title} ${row.description}`.toLowerCase().includes(String(q).toLowerCase()));
  res.json({ documents: rows });
});

app.get('/api/exams', (req, res) => {
  const rows = db.prepare('SELECT * FROM exams ORDER BY created_at DESC').all();
  res.json({ exams: rows });
});

app.get('/api/quizzes', (req, res) => {
  const rows = db.prepare('SELECT * FROM quizzes ORDER BY title').all();
  res.json({ quizzes: rows });
});

app.post('/api/quizzes/submit', authMiddleware, (req, res) => {
  const { quizId, answers } = req.body;
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
  if (!quiz) return res.status(404).json({ error: 'Quiz introuvable.' });

  const questions = JSON.parse(quiz.questions || '[]');
  let score = 0;

  questions.forEach((question) => {
    const userAnswer = answers?.[question.id] || [];
    const isCorrect = Array.isArray(question.correctAnswers)
      ? JSON.stringify([...question.correctAnswers].sort()) === JSON.stringify([...userAnswer].sort())
      : false;
    if (isCorrect) score += 1;
  });

  const attemptId = uuidv4();
  db.prepare('INSERT INTO quiz_attempts (id, user_id, quiz_id, score, total) VALUES (?, ?, ?, ?, ?)').run(attemptId, req.user.id, quizId, score, questions.length);

  res.json({
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    result: `${score}/${questions.length}`,
    questions
  });
});

app.get('/api/questions', (req, res) => {
  const rows = db.prepare(`
    SELECT q.*, u.first_name, u.last_name, u.photo_url,
      (SELECT json_group_array(json_object('id', a.id, 'user_id', a.user_id, 'content', a.content, 'created_at', a.created_at)) FROM answers a WHERE a.question_id = q.id) as answers
    FROM questions q
    LEFT JOIN users u ON u.id = q.user_id
    ORDER BY q.created_at DESC
  `).all();

  res.json({ questions: rows.map((row) => ({ ...row, answers: row.answers ? JSON.parse(row.answers) : [] })) });
});

app.post('/api/questions', authMiddleware, (req, res) => {
  const { title, content, subjectId, category } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Titre et contenu requis.' });
  const id = uuidv4();
  db.prepare('INSERT INTO questions (id, user_id, title, content, subject_id, category) VALUES (?, ?, ?, ?, ?, ?)').run(id, req.user.id, title, content, subjectId || '', category || 'Autres');
  res.status(201).json({ message: 'Question publiée avec succès.' });
});

app.get('/api/medicines', (req, res) => {
  const { q } = req.query;
  let rows = db.prepare('SELECT * FROM medicines ORDER BY name').all();
  if (q) {
    rows = rows.filter((item) => `${item.name} ${item.dci} ${item.therapeutic_class}`.toLowerCase().includes(String(q).toLowerCase()));
  }
  res.json({ medicines: rows });
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ notifications: rows, unread: rows.filter((row) => !row.is_read).length });
});

app.patch('/api/notifications/read', authMiddleware, (req, res) => {
  if (req.body.id) db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.body.id, req.user.id);
  else db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
  res.json({ message: 'Notification(s) marquée(s) comme lue(s).' });
});

app.get('/api/profile/activity', authMiddleware, (req, res) => {
  const contributions = db.prepare("SELECT COUNT(*) as total, SUM(status = 'published') as published, SUM(status = 'pending') as pending, SUM(status = 'refused') as refused FROM documents WHERE submitted_by = ?").get(req.user.id);
  const quizzes = db.prepare('SELECT COUNT(*) as total, COALESCE(MAX(percentage), 0) as best, COALESCE(AVG(percentage), 0) as average FROM quiz_attempts WHERE user_id = ?').get(req.user.id);
  res.json({ contributions, quizzes });
});

app.post('/api/reports', authMiddleware, (req, res) => {
  const { type, description } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO reports (id, user_id, type, description) VALUES (?, ?, ?, ?)').run(id, req.user.id, type, description);
  res.status(201).json({ message: 'Signalement envoyé à l’administrateur.' });
});

app.post('/api/suggestions', authMiddleware, (req, res) => {
  const { title, description } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO suggestions (id, user_id, title, description) VALUES (?, ?, ?, ?)').run(id, req.user.id, title, description);
  res.status(201).json({ message: 'Suggestion envoyée avec succès.' });
});

app.get('/api/dashboard', authMiddleware, (req, res) => {
  const recentSubjects = db.prepare('SELECT * FROM subjects WHERE semester = ? ORDER BY name LIMIT 4').all(req.user.semester || 'S5');
  const recentDocuments = db.prepare('SELECT * FROM documents ORDER BY created_at DESC LIMIT 4').all();
  const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY title LIMIT 3').all();
  const questions = db.prepare('SELECT * FROM questions ORDER BY created_at DESC LIMIT 3').all();
  const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 5').all(req.user.id);
  const attempts = db.prepare('SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 5').all(req.user.id);

  res.json({
    user: sanitizeUser(req.user),
    recentSubjects,
    recentDocuments,
    quizzes,
    questions,
    notifications,
    attempts
  });
});

app.get('/api/admin/summary', authMiddleware, adminMiddleware, (req, res) => {
  const counts = {
    users: db.prepare('SELECT COUNT(*) as count FROM users').get().count,
    newUsers: db.prepare("SELECT COUNT(*) as count FROM users WHERE created_at >= datetime('now', '-30 days')").get().count,
    subjects: db.prepare('SELECT COUNT(*) as count FROM subjects').get().count,
    documents: db.prepare('SELECT COUNT(*) as count FROM documents').get().count,
    publishedDocuments: db.prepare("SELECT COUNT(*) as count FROM documents WHERE COALESCE(status, 'published') = 'published'").get().count,
    pendingDocuments: db.prepare("SELECT COUNT(*) as count FROM documents WHERE status = 'pending'").get().count,
    refusedDocuments: db.prepare("SELECT COUNT(*) as count FROM documents WHERE status = 'refused'").get().count,
    courses: db.prepare('SELECT COUNT(*) as count FROM courses').get().count,
    quizzes: db.prepare('SELECT COUNT(*) as count FROM quizzes').get().count,
    exams: db.prepare('SELECT COUNT(*) as count FROM exams').get().count,
    suggestions: db.prepare('SELECT COUNT(*) as count FROM suggestions').get().count,
    reports: db.prepare('SELECT COUNT(*) as count FROM reports').get().count
  };
  res.json({ counts });
});

app.post('/api/documents/contribute', authMiddleware, upload.single('file'), (req, res) => {
  const { title, description, subjectId, semester, type, year } = req.body;
  if (req.user.role !== 'user') return res.status(403).json({ error: 'Seuls les étudiants peuvent proposer une contribution.' });
  if (!title || !subjectId || !req.file) return res.status(400).json({ error: 'Titre, matière et fichier requis.' });
  const id = uuidv4();
  const filePath = `/uploads/${req.file.filename}`;
  db.prepare(`INSERT INTO documents (id, title, description, subject_id, semester, type, category, author, file_name, file_path, status, submitted_by, year)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)`)
    .run(id, title, description || '', subjectId, semester || 'S5', type || 'PDF', type || 'Autre', `${req.user.first_name} ${req.user.last_name}`, req.file.originalname, filePath, req.user.id, year || null);
  db.prepare('INSERT INTO notifications (id, user_id, title, message, link) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), req.user.id, 'Document envoyé', 'Votre document est en attente de validation.', '/contributions');
  res.status(201).json({ message: 'Document envoyé pour validation.', id });
});

app.get('/api/documents/mine', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM documents WHERE submitted_by = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ documents: rows });
});

app.get('/api/admin/documents/pending', authMiddleware, adminMiddleware, (req, res) => {
  const rows = db.prepare(`SELECT d.*, u.first_name, u.last_name, u.email
    FROM documents d LEFT JOIN users u ON u.id = d.submitted_by
    WHERE d.status = 'pending' ORDER BY d.created_at ASC`).all();
  res.json({ documents: rows });
});

app.patch('/api/admin/documents/:id/status', authMiddleware, adminMiddleware, (req, res) => {
  const { status, rejectionReason, title, semester, subjectId, category } = req.body;
  if (!['published', 'refused', 'archived'].includes(status)) return res.status(400).json({ error: 'Statut invalide.' });
  if (status === 'refused' && !rejectionReason) return res.status(400).json({ error: 'Un motif est obligatoire pour refuser un document.' });
  const document = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!document) return res.status(404).json({ error: 'Document introuvable.' });
  db.prepare('UPDATE documents SET status = ?, title = COALESCE(?, title), semester = COALESCE(?, semester), subject_id = COALESCE(?, subject_id), category = COALESCE(?, category), reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, rejection_reason = ? WHERE id = ?').run(status, title || null, semester || null, subjectId || null, category || null, req.user.id, rejectionReason || null, req.params.id);
  if (document.submitted_by) {
    const message = status === 'published' ? 'Votre document a été validé et publié.' : status === 'refused' ? `Votre document a été refusé : ${rejectionReason}` : 'Votre document a été archivé.';
    db.prepare('INSERT INTO notifications (id, user_id, title, message, link) VALUES (?, ?, ?, ?, ?)').run(uuidv4(), document.submitted_by, 'Mise à jour de votre document', message, '/contributions');
  }
  res.json({ message: 'Statut du document mis à jour.' });
});

app.get('/api/search', (req, res) => {
  const query = (req.query.q || '').toString().trim().toLowerCase();
  if (!query) return res.json({ results: [] });

  const results = [];

  const subjects = db.prepare('SELECT * FROM subjects').all();
  subjects.forEach((item) => {
    if (`${item.name} ${item.description}`.toLowerCase().includes(query)) {
      results.push({ type: 'Matière', label: item.name, link: `/niveaux/${item.semester}?subject=${item.id}` });
    }
  });

  const documents = db.prepare("SELECT * FROM documents WHERE COALESCE(status, 'published') = 'published'").all();
  documents.forEach((item) => {
    if (`${item.title} ${item.description}`.toLowerCase().includes(query)) {
      results.push({ type: 'Document', label: item.title, link: `/documents` });
    }
  });

  const medicines = db.prepare('SELECT * FROM medicines').all();
  medicines.forEach((item) => {
    if (`${item.name} ${item.dci}`.toLowerCase().includes(query)) {
      results.push({ type: 'Médicament', label: item.name, link: `/medicaments` });
    }
  });

  const questions = db.prepare('SELECT * FROM questions').all();
  questions.forEach((item) => {
    if (`${item.title} ${item.content}`.toLowerCase().includes(query)) {
      results.push({ type: 'Question', label: item.title, link: `/entraide` });
    }
  });

  res.json({ results: results.slice(0, 20) });
});

app.get('/api/messages', (req, res) => {
  const rows = db.prepare('SELECT * FROM messages ORDER BY created_at ASC').all();
  res.json({ messages: rows });
});

app.post('/api/messages', authMiddleware, (req, res) => {
  const { room, content } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO messages (id, room, user_id, content) VALUES (?, ?, ?, ?)').run(id, room || 'general', req.user.id, content);
  res.status(201).json({ message: 'Message envoyé.' });
});

app.post('/api/admin/subject', authMiddleware, adminMiddleware, (req, res) => {
  const { name, semester, description, category } = req.body;
  if (!name || !semester) return res.status(400).json({ error: 'Nom et semestre requis.' });
  const id = uuidv4();
  db.prepare('INSERT INTO subjects (id, name, semester, description, category) VALUES (?, ?, ?, ?, ?)').run(id, name, semester, description || '', category || 'Général');
  res.status(201).json({ message: 'Matière ajoutée.' });
});

app.post('/api/admin/documents', authMiddleware, adminMiddleware, upload.single('file'), (req, res) => {
  const { title, description, subjectId, semester, type, category, author, year, tags } = req.body;
  if (!title || !subjectId) return res.status(400).json({ error: 'Titre et matière requis.' });

  const fileName = req.file ? req.file.originalname : 'document.pdf';
  const filePath = req.file ? `/uploads/${req.file.filename}` : '/uploads/sample.pdf';

  const id = uuidv4();
  db.prepare('INSERT INTO documents (id, title, description, subject_id, semester, type, category, author, file_name, file_path, status, submitted_by, year, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, \'published\', ?, ?, ?, ?)')
    .run(id, title, description || '', subjectId, semester || 'S5', type || 'PDF', category || 'Autre', author || 'Admin', fileName, filePath, req.user.id, year || null, tags || '');

  res.status(201).json({ message: 'Document ajouté.' });
});

app.get('/api/admin/reports', authMiddleware, adminMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
  res.json({ reports: rows });
});

app.get('/api/admin/suggestions', authMiddleware, adminMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM suggestions ORDER BY created_at DESC').all();
  res.json({ suggestions: rows });
});

app.listen(PORT, () => {
  console.log(`PharmaCampus API running on http://localhost:${PORT}`);
});
