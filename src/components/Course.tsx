import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeft, Clock, BarChart } from 'lucide-react';
import { User, Course as CourseType } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface CourseProps {
  user: User;
}

export function Course({ user }: CourseProps) {
  const { courseId, difficulty } = useParams<{ courseId: string; difficulty: string }>();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) throw error;
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course:', error);
        navigate('/courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Course not found.</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Courses
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <img
          src={course.image_url}
          alt={course.title}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-500">
                <Clock className="h-5 w-5 mr-1" />
                <span>{course.duration} mins</span>
              </div>
              <div className="flex items-center text-gray-500">
                <BarChart className="h-5 w-5 mr-1" />
                <span className="capitalize">{difficulty} Level</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{course.description}</p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Your Learning Path
            </h2>
            <p className="text-blue-700">
              Based on your assessment, you're following the{' '}
              <span className="font-semibold capitalize">{difficulty}</span> track for this course.
            </p>
          </div>

          {/* Course content will be added here based on the difficulty level */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Course Content</h2>
            <p className="text-gray-600">
              Course content for {difficulty} level will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}