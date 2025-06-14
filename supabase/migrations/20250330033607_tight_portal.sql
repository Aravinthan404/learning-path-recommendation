/*
  # Assessment System Setup

  1. New Tables
    - `assessments`
      - `id` (uuid, primary key)
      - `course_id` (uuid, references courses)
      - `title` (text)
      - `description` (text)
      - `passing_score` (integer)
      - `created_at` (timestamp with time zone)

    - `assessment_questions`
      - `id` (uuid, primary key)
      - `assessment_id` (uuid, references assessments)
      - `question` (text)
      - `options` (jsonb, array of options)
      - `correct_answer` (text)
      - `difficulty_level` (text)
      - `created_at` (timestamp with time zone)

    - `user_assessments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `assessment_id` (uuid, references assessments)
      - `score` (integer)
      - `completed_at` (timestamp with time zone)
      - `assigned_difficulty` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  passing_score integer NOT NULL CHECK (passing_score > 0 AND passing_score <= 100),
  created_at timestamptz DEFAULT now()
);

-- Create assessment questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE,
  question text NOT NULL,
  options jsonb NOT NULL,
  correct_answer text NOT NULL,
  difficulty_level text NOT NULL CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz DEFAULT now()
);

-- Create user assessments table
CREATE TABLE IF NOT EXISTS user_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id uuid REFERENCES assessments(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  completed_at timestamptz DEFAULT now(),
  assigned_difficulty text NOT NULL CHECK (assigned_difficulty IN ('beginner', 'intermediate', 'advanced'))
);

-- Enable Row Level Security
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assessments ENABLE ROW LEVEL SECURITY;

-- Assessment policies
CREATE POLICY "Anyone can read assessments"
  ON assessments
  FOR SELECT
  TO authenticated
  USING (true);

-- Assessment questions policies
CREATE POLICY "Anyone can read assessment questions"
  ON assessment_questions
  FOR SELECT
  TO authenticated
  USING (true);

-- User assessments policies
CREATE POLICY "Users can read own assessments"
  ON user_assessments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON user_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert sample assessment data
INSERT INTO assessments (course_id, title, description, passing_score) 
SELECT 
  id,
  'Initial Assessment',
  'Complete this assessment to determine your skill level for this course.',
  70
FROM courses;

-- Insert sample questions for Web Development assessment
INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, difficulty_level)
SELECT
  a.id,
  'What does HTML stand for?',
  '[
    "Hyper Text Markup Language",
    "High Tech Modern Language",
    "Hyper Transfer Markup Logic",
    "Home Tool Markup Language"
  ]'::jsonb,
  'Hyper Text Markup Language',
  'beginner'
FROM assessments a
JOIN courses c ON a.course_id = c.id
WHERE c.title = 'Introduction to Web Development';

INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, difficulty_level)
SELECT
  a.id,
  'Which of the following is used for styling web pages?',
  '[
    "CSS",
    "XML",
    "JSON",
    "SQL"
  ]'::jsonb,
  'CSS',
  'beginner'
FROM assessments a
JOIN courses c ON a.course_id = c.id
WHERE c.title = 'Introduction to Web Development';

-- Insert intermediate level questions
INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, difficulty_level)
SELECT
  a.id,
  'What is the purpose of the useEffect hook in React?',
  '[
    "To handle side effects in functional components",
    "To create new React components",
    "To style React components",
    "To debug React applications"
  ]'::jsonb,
  'To handle side effects in functional components',
  'intermediate'
FROM assessments a
JOIN courses c ON a.course_id = c.id
WHERE c.title = 'React Fundamentals';

-- Insert advanced level questions
INSERT INTO assessment_questions (assessment_id, question, options, correct_answer, difficulty_level)
SELECT
  a.id,
  'Which pattern is used to handle asynchronous operations in JavaScript?',
  '[
    "Promises",
    "Variables",
    "Functions",
    "Classes"
  ]'::jsonb,
  'Promises',
  'advanced'
FROM assessments a
JOIN courses c ON a.course_id = c.id
WHERE c.title = 'Advanced JavaScript Patterns';