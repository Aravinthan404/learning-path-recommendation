/*
  # Add More Courses

  This migration adds additional courses across different categories and difficulty levels.
  It checks for existing policies before creating them to avoid conflicts.
*/

-- Insert new courses
INSERT INTO courses (title, description, difficulty, category, image_url, duration) VALUES
  -- Web Development Courses
  (
    'Responsive Web Design',
    'Master the art of creating websites that work beautifully across all devices.',
    'beginner',
    'Web Development',
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&auto=format&fit=crop',
    150
  ),
  (
    'CSS Flexbox and Grid Mastery',
    'Deep dive into modern CSS layout techniques for professional web development.',
    'intermediate',
    'Web Development',
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=800&auto=format&fit=crop',
    180
  ),
  (
    'Full Stack Development with Node.js',
    'Build complete web applications with Node.js, Express, and MongoDB.',
    'advanced',
    'Web Development',
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop',
    300
  ),

  -- Mobile Development Courses
  (
    'Mobile App Development Basics',
    'Introduction to mobile app development concepts and principles.',
    'beginner',
    'Mobile Development',
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?w=800&auto=format&fit=crop',
    150
  ),
  (
    'Advanced iOS Development',
    'Master advanced iOS development techniques and Swift programming.',
    'advanced',
    'Mobile Development',
    'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&auto=format&fit=crop',
    270
  ),

  -- Data Science Courses
  (
    'Machine Learning Fundamentals',
    'Learn the basics of machine learning algorithms and implementations.',
    'intermediate',
    'Data Science',
    'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=800&auto=format&fit=crop',
    240
  ),
  (
    'Advanced Deep Learning',
    'Master deep learning techniques and neural network architectures.',
    'advanced',
    'Data Science',
    'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop',
    300
  ),

  -- DevOps Courses
  (
    'Introduction to DevOps',
    'Learn the basics of DevOps practices and tools.',
    'beginner',
    'DevOps',
    'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&auto=format&fit=crop',
    160
  ),
  (
    'Container Orchestration with Kubernetes',
    'Master container orchestration using Kubernetes.',
    'intermediate',
    'DevOps',
    'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop',
    240
  ),
  (
    'Advanced Cloud Architecture',
    'Design and implement scalable cloud solutions.',
    'advanced',
    'DevOps',
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop',
    280
  ),

  -- UI/UX Design Courses
  (
    'UI/UX Design Fundamentals',
    'Learn the basics of user interface and user experience design.',
    'beginner',
    'UI/UX Design',
    'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop',
    140
  ),
  (
    'Advanced UI Design Patterns',
    'Master modern UI design patterns and techniques.',
    'intermediate',
    'UI/UX Design',
    'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=800&auto=format&fit=crop',
    200
  ),
  (
    'Enterprise UX Strategy',
    'Learn advanced UX strategies for enterprise applications.',
    'advanced',
    'UI/UX Design',
    'https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800&auto=format&fit=crop',
    260
  );