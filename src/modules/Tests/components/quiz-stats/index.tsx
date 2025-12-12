import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, TrendingUp, Award, Target, BookOpen, ArrowLeft } from "lucide-react";
import { api } from "../../../../services/api";
import { motion } from "framer-motion";

const QuizStatsPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [history, setHistory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id") || `user_${Date.now()}`;

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const [statsData, historyData] = await Promise.all([
        api.quiz.getStats(userId),
        api.quiz.getHistory(userId, 10),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats || stats.total_quizzes === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">
            Вы еще не проходили квизы
          </p>
          <button
            onClick={() => navigate("/quiz-api")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
          >
            Начать квиз
          </button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            onClick={() => navigate("/quiz-api")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-4"
          >
            <ArrowLeft size={20} />
            Назад к квизам
          </button>

          <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
            📊 Моя статистика
          </h1>
          <p className="text-gray-600">Анализ вашего прогресса в обучении</p>
        </motion.div>

        {/* Общая статистика */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.total_quizzes}
                </p>
                <p className="text-sm text-gray-600">Пройдено квизов</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-green-100 rounded-lg">
                <Award size={24} className="text-green-600" />
              </div>
              <div>
                <p className={`text-3xl font-bold ${getScoreColor(stats.average_score)}`}>
                  {stats.average_score}%
                </p>
                <p className="text-sm text-gray-600">Средний балл</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target size={24} className="text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.total_questions_answered}
                </p>
                <p className="text-sm text-gray-600">Вопросов отвечено</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp size={24} className="text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">
                  {stats.recent_scores?.[stats.recent_scores.length - 1] || 0}%
                </p>
                <p className="text-sm text-gray-600">Последний результат</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* График прогресса */}
        {stats.recent_scores && stats.recent_scores.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📈 Прогресс (последние {stats.recent_scores.length} квизов)
            </h2>
            <div className="flex items-end gap-2 h-48">
              {stats.recent_scores.map((score: number, idx: number) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
                    style={{ height: `${score}%` }}
                  />
                  <p className={`text-sm font-bold ${getScoreColor(score)}`}>
                    {score}%
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Слабые темы */}
        {stats.weak_topics && stats.weak_topics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-6 shadow-lg mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-xl font-bold text-yellow-900">
                Темы, требующие внимания
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {stats.weak_topics.map((topic: string, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white bg-opacity-60 rounded-lg p-3"
                >
                  <span className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-yellow-900">{topic}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* История квизов */}
        {history && history.recent_quizzes && history.recent_quizzes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              📚 История квизов
            </h2>
            <div className="space-y-3">
              {history.recent_quizzes.map((quiz: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{quiz.topic}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(quiz.timestamp).toLocaleDateString("ru-RU", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${getScoreColor(quiz.score_percentage)}`}>
                      {quiz.score_percentage}%
                    </p>
                    <p className="text-sm text-gray-500">
                      {quiz.correct_answers}/{quiz.total_questions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizStatsPage;
