import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Clock, BarChart } from 'lucide-react';
import { User, Course, Assessment } from '../types';
import { CourseAssessment } from './Assessment';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface CoursesProps {
  user: User;
}

export function Courses({ user }: CoursesProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let query = supabase.from('courses').select('*');

        if (selectedCategory !== 'all') {
          query = query.eq('category', selectedCategory);
        }
        if (selectedDifficulty !== 'all') {
          query = query.eq('difficulty', selectedDifficulty);
        }

        const { data, error } = await query;
        if (error) throw error;
        setCourses(data || []);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [selectedCategory, selectedDifficulty]);

  const handleStartCourse = (course: Course) => {
    setSelectedCourse(course);
    setShowAssessment(true);
  };

  const handleAssessmentComplete = async (courseId: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => {
    try {
      // Check if a progress record already exists
      const { data: existingProgress, error: selectError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') throw selectError;

      if (existingProgress) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('user_progress')
          .update({
            progress: 0,
            completed: false,
            last_accessed: new Date().toISOString(),
            quiz_scores: {}
          })
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (updateError) throw updateError;
      } else {
        // Create new progress record
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            user_id: user.id,
            course_id: courseId,
            progress: 0,
            completed: false,
            quiz_scores: {}
          });

        if (insertError) throw insertError;
      }

      // Navigate to the course page with the assigned difficulty
      navigate(`/course/${courseId}/${difficulty}`);
    } catch (error) {
      console.error('Error starting course:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showAssessment && selectedCourse) {
    return (
      <CourseAssessment
        user={user}
        course={selectedCourse}
        onComplete={handleAssessmentComplete}
      />
    );
  }

  const categories = ['all', ...new Set(courses.map((course) => course.category))];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold">Available Courses</h1>
        <div className="flex space-x-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{course.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{course.duration} mins</span>
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <BarChart className="h-4 w-4 mr-1" />
                    <span className="capitalize">{course.difficulty}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleStartCourse(course)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Start Course
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}