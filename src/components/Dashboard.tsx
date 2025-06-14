import React, { useEffect, useState } from 'react';
import { BookOpen, Award, Clock, TrendingUp } from 'lucide-react';
import { User, Course, UserProgress } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesResponse, progressResponse] = await Promise.all([
          supabase.from('courses').select('*').limit(5),
          supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .order('last_accessed', { ascending: false })
            .limit(5),
        ]);

        if (coursesResponse.error) throw coursesResponse.error;
        if (progressResponse.error) throw progressResponse.error;

        setCourses(coursesResponse.data || []);
        setProgress(progressResponse.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Enrolled Courses</p>
              <p className="text-2xl font-semibold">{progress.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Completed</p>
              <p className="text-2xl font-semibold">
                {progress.filter((p) => p.completed).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Hours Spent</p>
              <p className="text-2xl font-semibold">
                {Math.round(
                  progress.reduce((acc, curr) => {
                    const course = courses.find((c) => c.id === curr.course_id);
                    return acc + ((course?.duration || 0) * curr.progress) / 100;
                  }, 0)
                )}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Avg. Score</p>
              <p className="text-2xl font-semibold">
                {Math.round(
                  progress.reduce((acc, curr) => {
                    const scores = Object.values(curr.quiz_scores || {});
                    return scores.length
                      ? acc + scores.reduce((a, b) => a + b, 0) / scores.length
                      : acc;
                  }, 0) / (progress.length || 1)
                )}%
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Progress</h2>
          <div className="space-y-4">
            {progress.map((p) => {
              const course = courses.find((c) => c.id === p.course_id);
              return (
                <div
                  key={p.course_id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={course?.image_url}
                      alt={course?.title}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div>
                      <h3 className="font-medium">{course?.title}</h3>
                      <p className="text-sm text-gray-500">
                        Last accessed:{' '}
                        {new Date(p.last_accessed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium">{p.progress}%</p>
                      <p className="text-xs text-gray-500">
                        {p.completed ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}