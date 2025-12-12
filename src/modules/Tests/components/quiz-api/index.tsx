import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { api, type QuizQuestion, type QuizAnswerResponse } from "../../../../services/api";

const QuizApiPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerResult, setAnswerResult] = useState<QuizAnswerResponse | null>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [finalResult, setFinalResult] = useState<any>(null);

  const userId = localStorage.getItem('user_id') || `user_${Date.now()}`;

  useEffect(() => {
    if (quizId) {
      loadQuestion(1);
    }
  }, [quizId]);

  const loadQuestion = async (questionNumber: number) => {
    try {
      setIsLoading(true);
      setAnswerResult(null);
      setSelectedAnswer(null);
      const question = await api.quiz.getQuestion(quizId!, questionNumber);
      setCurrentQuestion(question);
      setCurrentIndex(questionNumber);
    } catch (err) {
      console.error('Error loading question:', err);
      alert('Ошибка при загрузке вопроса');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedAnswer === null || !currentQuestion) return;

    try {
      setIsSubmitting(true);
      const result = await api.quiz.submitAnswer({
        quiz_id: quizId!,
        question_number: currentIndex,
        selected_answer: selectedAnswer,
      });

      setAnswerResult(result);

      // Сохранить ответ в локальный массив
      setAnswers((prev) => [
        ...prev,
        {
          question_number: currentIndex,
          question: currentQuestion.question,
          selected_answer: selectedAnswer,
          correct_answer: result.correct_answer,
          is_correct: result.is_correct,
          topic: currentQuestion.topic,
          explanation: result.explanation,
        },
      ]);
    } catch (err) {
      console.error('Error submitting answer:', err);
      alert('Ошибка при отправке ответа');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!currentQuestion) return;

    if (currentIndex < currentQuestion.total_questions) {
      loadQuestion(currentIndex + 1);
    } else {
      // Завершить квиз
      await completeQuiz();
    }
  };

  const completeQuiz = async () => {
    try {
      setIsLoading(true);
      const result = await api.quiz.completeQuiz({
        quiz_id: quizId!,
        user_id: userId,
        answers,
      });

      setFinalResult(result);
      setIsFinished(true);
    } catch (err) {
      console.error('Error completing quiz:', err);
      alert('Ошибка при завершении квиза');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    const confirmLeave = window.confirm(
      "Квиз останется незавершенным. Вы уверены, что хотите выйти?"
    );
    if (confirmLeave) {
      // Квиз остается в БД со статусом "in_progress"
      navigate("/quiz-api");
    }
  };

  if (isLoading && !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 size={48} className="animate-spin text-blue-600" />
      </div>
    );
  }

  if (isFinished && finalResult) {
    const getScoreColor = (percentage: number) => {
      if (percentage >= 80) return "text-green-600";
      if (percentage >= 60) return "text-blue-600";
      if (percentage >= 40) return "text-yellow-600";
      return "text-red-600";
    };

    const getScoreMessage = (percentage: number) => {
      if (percentage >= 90) return "Превосходно! 🌟";
      if (percentage >= 80) return "Отлично! 👏";
      if (percentage >= 70) return "Хорошо! 👍";
      if (percentage >= 60) return "Неплохо! 📚";
      if (percentage >= 50) return "Удовлетворительно 📖";
      return "Нужно повторить материал 💪";
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100"
      >
        <div className="max-w-3xl w-full bg-white shadow-xl rounded-2xl p-8 space-y-6">
          <h2 className="text-3xl font-bold text-gray-800 text-center">
            🎉 Квиз завершен!
          </h2>

          <div className="text-center space-y-2">
            <p className={`text-6xl font-bold ${getScoreColor(finalResult.score_percentage)}`}>
              {finalResult.score_percentage}%
            </p>
            <p className="text-2xl font-semibold text-gray-600">
              {getScoreMessage(finalResult.score_percentage)}
            </p>
            <p className="text-gray-700 text-lg">
              Правильных ответов: <span className="font-bold">{finalResult.correct_answers}</span> из{" "}
              {finalResult.total_questions}
            </p>
          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${finalResult.score_percentage}%` }}
              transition={{ duration: 0.8 }}
              className={`h-full ${
                finalResult.score_percentage >= 80
                  ? "bg-green-600"
                  : finalResult.score_percentage >= 60
                  ? "bg-blue-600"
                  : finalResult.score_percentage >= 40
                  ? "bg-yellow-600"
                  : "bg-red-600"
              }`}
            />
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{finalResult.correct_answers}</p>
              <p className="text-sm text-green-700 font-medium">Правильно</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">{finalResult.wrong_answers}</p>
              <p className="text-sm text-red-700 font-medium">Неправильно</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{finalResult.total_questions}</p>
              <p className="text-sm text-blue-700 font-medium">Всего</p>
            </div>
          </div>

          {/* Анализ слабых мест */}
          {finalResult.weak_topics.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⚠️</span>
                <h3 className="text-xl font-bold text-yellow-900">
                  Анализ слабых мест
                </h3>
              </div>
              <p className="text-sm text-yellow-800 mb-3">
                AI обнаружил, что вам стоит уделить больше внимания следующим темам:
              </p>
              <ul className="space-y-2">
                {finalResult.weak_topics.map((topic: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-yellow-900">
                    <span className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-semibold">{topic}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Рекомендации AI */}
          {finalResult.recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-5 shadow-md">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">💡</span>
                <h3 className="text-xl font-bold text-blue-900">
                  Рекомендации для улучшения
                </h3>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                AI предлагает следующие шаги для повышения результатов:
              </p>
              <ul className="space-y-2">
                {finalResult.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-blue-900">
                    <span className="text-blue-600 font-bold mt-1">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-gray-800">Детали ответов:</h3>
            {finalResult.detailed_answers.map((answer: any, idx: number) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border ${
                  answer.is_correct
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-start gap-2">
                  {answer.is_correct ? (
                    <CheckCircle size={20} className="text-green-600 mt-1" />
                  ) : (
                    <XCircle size={20} className="text-red-600 mt-1" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">
                      {idx + 1}. {answer.question}
                    </p>
                    {!answer.is_correct && (
                      <p className="text-sm text-gray-600 mt-1">
                        Правильный ответ:{" "}
                        <span className="font-semibold">
                          {answer.correct_answer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Действия */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/quiz-api")}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold shadow-md hover:shadow-lg"
            >
              Новый квиз
            </button>
            <button
              onClick={() => navigate("/chat")}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-semibold shadow-md hover:shadow-lg"
            >
              Спросить AI
            </button>
          </div>

          {/* Совет */}
          {finalResult.score_percentage < 70 && finalResult.weak_topics.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-purple-900 font-medium">
                💬 Спросите AI о темах, которые вам не понятны, в разделе "Чат"
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full bg-white shadow-lg rounded-2xl p-8 space-y-6"
      >
        {/* Кнопка Назад */}
        <button
          onClick={handleGoBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition mb-4"
        >
          <ArrowLeft size={20} />
          Назад к квизам
        </button>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {currentQuestion.topic}
          </h2>
          <span className="text-gray-600 text-sm font-medium">
            Вопрос {currentIndex} / {currentQuestion.total_questions}
          </span>
        </div>

        <p className="text-lg text-gray-700 font-medium">
          {currentQuestion.question}
        </p>

        <div className="grid gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            const showResult = answerResult !== null;
            const isCorrect = answerResult?.correct_answer === idx;
            const isWrong = showResult && isSelected && !answerResult.is_correct;

            return (
              <motion.button
                key={idx}
                onClick={() => !showResult && setSelectedAnswer(idx)}
                disabled={showResult}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                className={`p-3 rounded-xl border-2 transition font-medium text-left ${
                  showResult && isCorrect
                    ? "bg-green-100 border-green-500 text-green-800"
                    : isWrong
                    ? "bg-red-100 border-red-500 text-red-800"
                    : isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-800 border-gray-300 hover:border-blue-400"
                } ${showResult ? "cursor-default" : ""}`}
              >
                {option}
              </motion.button>
            );
          })}
        </div>

        {answerResult && (
          <div
            className={`p-4 rounded-lg ${
              answerResult.is_correct
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`font-semibold mb-2 ${
                answerResult.is_correct ? "text-green-800" : "text-red-800"
              }`}
            >
              {answerResult.is_correct ? "Правильно!" : "Неправильно"}
            </p>
            <p className="text-gray-700 text-sm">{answerResult.explanation}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="flex-1 bg-gray-200 h-2 rounded-full">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{
                width: `${(currentIndex / currentQuestion.total_questions) * 100}%`,
              }}
            />
          </div>

          {!answerResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null || isSubmitting}
              className={`px-6 py-2 rounded-lg text-white font-semibold transition ${
                selectedAnswer === null || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                "Ответить"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              {currentIndex === currentQuestion.total_questions
                ? "Завершить"
                : "Далее"}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuizApiPage;
