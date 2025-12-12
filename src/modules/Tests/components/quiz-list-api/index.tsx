import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, BookOpen, PlusCircle, Sparkles } from "lucide-react";
import { api, type TopicInfo } from "../../../../services/api";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

const QuizListApiPage = () => {
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(15);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  // Генерация user_id
  const userId = localStorage.getItem('user_id') || `user_${Date.now()}`;

  useEffect(() => {
    localStorage.setItem('user_id', userId);
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.quiz.getTopics('ru');
      setTopics(data);
    } catch (err) {
      console.error('Error loading topics:', err);
      setError('Не удалось загрузить темы. Убедитесь, что backend запущен.');
    } finally {
      setIsLoading(false);
    }
  };

  const startQuiz = async (topic: TopicInfo, difficulty: 'easy' | 'medium' | 'hard') => {
    try {
      const response = await api.quiz.generateQuiz({
        user_id: userId,
        mode: 'topic_select',
        topic: topic.full_name,
        num_questions: 15,
        difficulty,
        language: 'ru',
      });

      // Переход на страницу квиза с quiz_id
      navigate(`/quiz-api/${response.quiz_id}`);
    } catch (err) {
      console.error('Error generating quiz:', err);
      alert('Ошибка при создании квиза. Проверьте, что backend запущен.');
    }
  };

  const createCustomQuiz = async () => {
    if (!customTopic.trim()) {
      alert('Введите тему для квиза');
      return;
    }

    try {
      setIsGenerating(true);
      console.log('🚀 Генерация квиза...', {
        user_id: userId,
        mode: 'free_text',
        topic: customTopic,
        num_questions: numQuestions,
        difficulty,
      });

      const response = await api.quiz.generateQuiz({
        user_id: userId,
        mode: 'free_text',
        topic: customTopic,
        num_questions: numQuestions,
        difficulty,
        language: 'ru',
      });

      console.log('✅ Квиз сгенерирован:', response);

      setShowCreateDialog(false);
      setCustomTopic("");
      setIsGenerating(false);

      // Переход на страницу квиза
      console.log('🔄 Переход на:', `/quiz-api/${response.quiz_id}`);
      navigate(`/quiz-api/${response.quiz_id}`);
    } catch (err: any) {
      console.error('❌ Error creating custom quiz:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMsg = err.response?.data?.detail || err.message || 'Неизвестная ошибка';
      alert(`Ошибка при создании квиза: ${errorMsg}`);
      setIsGenerating(false);
    }
  };

  const filtered = topics.filter((topic) =>
    topic.full_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={loadTopics}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex-1">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 tracking-tight">
            Выберите тему для <span className="text-blue-600">квиза</span>
          </h1>
          <p className="text-center text-gray-600 mt-2">
            AI создаст для вас уникальный тест по выбранной теме
          </p>
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition shadow-lg hover:shadow-xl font-semibold"
        >
          <Sparkles size={20} />
          Создать свой квиз с AI
        </button>
        <button
          onClick={() => navigate("/quiz-stats")}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl font-semibold"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Моя статистика
        </button>
      </div>

      {/* Поиск */}
      <div className="flex justify-center mb-10">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Поиск по темам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 pl-10 pr-3 py-2 rounded-xl w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Список тем */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.map((topic, idx) => (
          <div
            key={idx}
            className="bg-white shadow-lg hover:shadow-xl border border-gray-100 rounded-2xl p-6 transition transform hover:-translate-y-1"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-800 mb-1">
                  {topic.name}
                </h2>
                <p className="text-sm text-gray-500">{topic.subject}</p>
              </div>
            </div>

            {topic.chunks && (
              <p className="text-xs text-gray-400 mb-4">
                {topic.chunks} материалов загружено
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => startQuiz(topic, 'easy')}
                className="flex-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
              >
                Легко
              </button>
              <button
                onClick={() => startQuiz(topic, 'medium')}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition text-sm font-medium"
              >
                Средне
              </button>
              <button
                onClick={() => startQuiz(topic, 'hard')}
                className="flex-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-medium"
              >
                Сложно
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center mt-16 text-gray-500">
          <p className="text-lg">Темы не найдены</p>
          <p className="text-sm mt-2">
            Загрузите материалы через backend API
          </p>
        </div>
      )}

      {/* Диалог создания своего квиза */}
      <Dialog
        header={
          <div className="flex items-center gap-2">
            <Sparkles className="text-purple-600" size={24} />
            <span>Создать свой квиз с AI</span>
          </div>
        }
        visible={showCreateDialog}
        style={{ width: "500px" }}
        onHide={() => !isGenerating && setShowCreateDialog(false)}
        footer={
          <div className="flex gap-3 justify-end">
            <Button
              label="Отмена"
              severity="secondary"
              onClick={() => setShowCreateDialog(false)}
              disabled={isGenerating}
            />
            <Button
              label={isGenerating ? "Генерация..." : "Создать квиз"}
              icon={isGenerating ? "pi pi-spin pi-spinner" : "pi pi-check"}
              onClick={createCustomQuiz}
              disabled={isGenerating || !customTopic.trim()}
              className="bg-purple-600 border-purple-600 hover:bg-purple-700"
            />
          </div>
        }
      >
        <div className="space-y-4 py-4">
          {/* Тема квиза */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Тема квиза
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="Например: Python основы, Математика 10 класс..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
              disabled={isGenerating}
            />
            <p className="text-xs text-gray-500 mt-1">
              AI создаст вопросы на основе загруженных материалов по этой теме
            </p>
          </div>

          {/* Количество вопросов */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Количество вопросов: {numQuestions}
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="w-full"
              disabled={isGenerating}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>5</span>
              <span>30</span>
            </div>
          </div>

          {/* Сложность */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Сложность
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setDifficulty("easy")}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  difficulty === "easy"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Легко
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  difficulty === "medium"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Средне
              </button>
              <button
                onClick={() => setDifficulty("hard")}
                disabled={isGenerating}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  difficulty === "hard"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Сложно
              </button>
            </div>
          </div>

          {isGenerating && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-center gap-3">
              <Loader2 size={20} className="animate-spin text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-900">
                  AI генерирует квиз...
                </p>
                <p className="text-xs text-purple-700">
                  Это может занять несколько секунд
                </p>
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default QuizListApiPage;
