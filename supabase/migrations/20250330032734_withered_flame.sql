/*
  # Initial Schema Setup

  1. New Tables
    - `courses`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `difficulty` (text, enum: beginner, intermediate, advanced)
      - `category` (text)
      - `image_url` (text)
      - `duration` (integer, minutes)
      - `created_at` (timestamp with time zone)

    - `user_progress`
      - `user_id` (uuid, references auth.users)
      - `course_id` (uuid, references courses)
      - `progress` (integer, percentage)
      - `completed` (boolean)
      - `last_accessed` (timestamp with time zone)
      - `quiz_scores` (jsonb)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to:
      - Read all courses
      - Read/write their own progress data
*/

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category text NOT NULL,
  image_url text NOT NULL,
  duration integer NOT NULL CHECK (duration > 0),
  created_at timestamptz DEFAULT now()
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  progress integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed boolean NOT NULL DEFAULT false,
  last_accessed timestamptz DEFAULT now(),
  quiz_scores jsonb DEFAULT '{}'::jsonb,
  PRIMARY KEY (user_id, course_id)
);

-- Enable Row Level Security
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can read courses"
  ON courses
  FOR SELECT
  TO authenticated
  USING (true);

-- User progress policies
CREATE POLICY "Users can read own progress"
  ON user_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert sample courses
INSERT INTO courses (title, description, difficulty, category, image_url, duration) VALUES
  (
    'Introduction to Web Development',
    'Learn the basics of HTML, CSS, and JavaScript to build modern websites.',
    'beginner',
    'Web Development',
    'https://images.unsplash.com/photo-1593720219276-0b1eacd0aef4?w=800&auto=format&fit=crop',
    120
  ),
  (
    'React Fundamentals',
    'Master the fundamentals of React, including components, state, and props.',
    'intermediate',
    'Web Development',
    'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop',
    180
  ),
  (
    'Advanced JavaScript Patterns',
    'Deep dive into advanced JavaScript patterns and best practices.',
    'advanced',
    'Web Development',
    'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&auto=format&fit=crop',
    240
  ),
  (
    'Mobile App Development with React Native',
    'Build cross-platform mobile apps using React Native.',
    'intermediate',
    'Mobile Development',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop',
    200
  ),
  (
    'Data Science Essentials',
    'Introduction to data science concepts and tools.',
    'beginner',
    'Data Science',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop',
    150
  );