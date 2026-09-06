export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  country?: string;
  city?: string;
  university?: string;
  level?: string;
  semester?: string;
  bio?: string;
  photo_url?: string;
};

export type Subject = {
  id: string;
  name: string;
  semester: string;
  description?: string;
  category?: string;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  subject_id?: string;
  semester?: string;
  level?: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  description?: string;
  subject_id?: string;
  semester?: string;
  type?: string;
  author?: string;
  file_name?: string;
  file_path?: string;
  status?: string;
  submitted_by?: string;
  year?: number;
  rejection_reason?: string;
  created_at?: string;
};

export type Quiz = {
  id: string;
  title: string;
  subject_id?: string;
  semester?: string;
  questions: string;
};

export type QuestionItem = {
  id: string;
  user_id?: string;
  title: string;
  content: string;
  subject_id?: string;
  category?: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
  answers?: Array<{ id: string; user_id: string; content: string; created_at?: string }>;
};

export type Medicine = {
  id: string;
  name: string;
  dci?: string;
  therapeutic_class?: string;
  indications?: string;
  dosage?: string;
  contraindications?: string;
  adverse_effects?: string;
  precautions?: string;
  interactions?: string;
  forms?: string;
  image?: string;
};
