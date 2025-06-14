import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Assessment, AssessmentQuestion, Course, User } from '../types';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

interface CourseAssessmentProps {
  user: User;
  course: Course;
  onComplete: (courseId: string, difficulty: 'beginner' | 'intermediate' | 'advanced') => void;
}

export function CourseAssessment({ user, course, onComplete }: CourseAssessmentProps) {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        // Get assessment for the course
        const { data: assessmentData, error: assessmentError } = await supabase
          .from('assessments')
          .select('*')
          .eq('course_id', course.id)
          .single();

        if (assessmentError) throw assessmentError;
        setAssessment(assessmentData);

        // Get questions for the assessment
        const { data: questionsData, error: questionsError } = await supabase
          .from('assessment_questions')
          .select('*')
          .eq('assessment_id', assessmentData.id);

        if (questionsError) throw questionsError;
        setQuestions(questionsData);
      } catch (error) {
        console.error('Error fetching assessment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessment();
  }, [course.id]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const calculateDifficulty = (score: number): 'beginner' | 'intermediate' | 'advanced' => {
    if (score < 50) return 'beginner';
    if (score < 80) return 'intermediate';
    return 'advanced';
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setSubmitting(true);

    try {
      // Calculate score
      const correctAnswers = questions.filter(
        (q) => answers[q.id] === q.correct_answer
      ).length;
      const score = Math.round((correctAnswers / questions.length) * 100);
      const assignedDifficulty = calculateDifficulty(score);

      // Save assessment result
      const { error } = await supabase.from('user_assessments').insert({
        user_id: user.id,
        assessment_id: assessment.id,
        score,
        assigned_difficulty: assignedDifficulty,
      });

      if (error) throw error;

      // Call the completion handler with the course ID and assigned difficulty
      onComplete(course.id, assignedDifficulty);
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assessment || questions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No assessment available for this course.</p>
        <button
          onClick={() => navigate('/courses')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{assessment.title}</h2>
        <p className="text-gray-600">{assessment.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Question {currentQuestion + 1} of {questions.length}
          </h3>
          <span className="text-sm text-gray-500">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}% Complete
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{
              width: `${Math.round(((currentQuestion + 1) / questions.length) * 100)}%`,
            }}
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="text-lg mb-4">{currentQ.question}</p>
        <div className="space-y-3">
          {currentQ.options.map((option, index) => (
            <label
              key={index}
              className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                answers[currentQ.id] === option
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-200'
              }`}
            >
              <input
                type="radio"
                name={`question-${currentQ.id}`}
                value={option}
                checked={answers[currentQ.id] === option}
                onChange={() => handleAnswer(currentQ.id, option)}
                className="sr-only"
              />
              <span className="ml-2">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentQuestion((prev) => prev - 1)}
          disabled={currentQuestion === 0}
          className={`px-4 py-2 rounded-md ${
            currentQuestion === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Previous
        </button>
        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => prev + 1)}
            disabled={!answers[currentQ.id]}
            className={`px-4 py-2 rounded-md ${
              !answers[currentQ.id]
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !answers[currentQ.id]}
            className={`px-4 py-2 rounded-md ${
              submitting || !answers[currentQ.id]
                ? 'bg-blue-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        )}
      </div>
    </div>
  );
}