const catalog = [
  ['S1', 1, ['Math / Info', 'Communication / Anglais', 'Chimie', 'Botanique', 'Biologie végétale', 'Biologie cellulaire']],
  ['S2', 1, ['Anatomie', 'Langue Étrangère', 'Chimie Analytique I', 'Systématique Botanique', 'Histologie / Embryologie', 'Initiation à la Pharmacie']],
  ['S3', 2, ['Biochimie structurale', 'Chimie Analytique II', 'Chimie Organique II', 'Hématologie Biologique', 'Microbiologie', 'Physiologie Végétale']],
  ['S4', 2, ['Anglais pour la Pharmacie', 'Immunologie', 'Chimie Analytique Instrumentale', 'Bases de la Biotechnologie', 'Chimie Organique II', 'Pharmacologie Générale']],
  ['S5', 3, ['Médecine sociale et santé publique', 'Essais Physicochimiques', 'Biochimie Métabolique', 'Microbiologie II / Immunologie', 'Parasitologie', 'Pharmacie Galénique I', 'Pharmacologie Spéciale I']],
  ['S6', 3, ["Informatique et Systèmes d'Aide", "Méthodes d'Analyse", 'Pharmacie Hospitalière', 'Toxicologie', 'Chimie Thérapeutique I', 'Langues Étrangères', 'Pharmacognosie I', 'Pharmacie Galénique II']],
  ['S7', 4, ['Bromatologie - Hydrologie', 'Chimie Thérapeutique II', 'Pharmacognosie spéciale et Essais', 'Pharmacologie Spéciale II', 'Sémiologie Pathologique I', 'Toxicologie II']],
  ['S8', 4, ['Pharmacotechnie', 'Biochimie Clinique', 'Biochimie Pré-Instrumentale', 'Sémiologie Pathologique II', 'Mycologie', 'Hématologie II']],
  ['S9', 5, ['Pharmacie clinique', 'Méthodologie de recherche', 'Médicaments vétérinaires', 'Hygiène', 'Droit pharmaceutique', 'Applications de biotechnologie']],
  ['S10', 5, ['Cosmétologie Médicale', 'Pharmacie Industrielle', "Toxicologie d'Urgence", 'Gestion Pharmaceutique', 'Gestion de Projet / Management', 'Nutrition Diététique']]
];

function moduleId(semester, name, order) {
  return `${semester}-${name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 18)}-${order}`;
}

function ensureAcademicCatalog(db) {
  const insertSemester = db.prepare('INSERT OR IGNORE INTO semesters (id, name, year, sort_order) VALUES (?, ?, ?, ?)');
  const insertModule = db.prepare('INSERT OR IGNORE INTO modules (id, semester_id, name, description, sort_order) VALUES (?, ?, ?, ?, ?)');
  const insertSubject = db.prepare('INSERT OR IGNORE INTO subjects (id, name, semester, description, category, module_id, semester_id) VALUES (?, ?, ?, ?, ?, ?, ?)');

  const seed = db.transaction(() => {
    catalog.forEach(([semester, year, modules]) => {
      const semesterOrder = Number(semester.slice(1));
      insertSemester.run(semester, semester, year, semesterOrder);
      modules.forEach((name, index) => {
        const id = moduleId(semester, name, index + 1);
        const description = `Ressources pédagogiques du module ${name}.`;
        insertModule.run(id, semester, name, description, index + 1);
        insertSubject.run(id, name, semester, description, 'Module', id, semester);
      });
    });
  });

  seed();
}

module.exports = { catalog, ensureAcademicCatalog, moduleId };