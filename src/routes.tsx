import { Routes, Route, Navigate } from "react-router-dom";
import Chat from "./modules/Chat";
import QuizletFlashcardsApp from "./modules/Cards";

// API-подключенные компоненты
import QuizListApiPage from "./modules/Tests/components/quiz-list-api";
import QuizApiPage from "./modules/Tests/components/quiz-api";
import QuizStatsPage from "./modules/Tests/components/quiz-stats";
import FlashcardsApiApp from "./modules/Cards/components/flashcards-api";


const AppRoutes = () => {
  return (
      <Routes>
        <Route path="/" element={<></>} />

        {/* Chat с AI backend */}
        <Route path="/chat" element={<Chat />} />

        {/* Квизы с AI backend */}
        <Route path="/quiz" element={<Navigate to="/quiz-api" replace />} />
        <Route path="/quiz-api" element={<QuizListApiPage />} />
        <Route path="/quiz-api/:quizId" element={<QuizApiPage />} />
        <Route path="/quiz-stats" element={<QuizStatsPage />} />

        <Route path="/game" element={<></>} />

        {/* Карточки */}
        <Route path="/cards" element={<Navigate to="/cards-api" replace />} />
        <Route path="/cards-old" element={<QuizletFlashcardsApp/>} />
        <Route path="/cards-api" element={<FlashcardsApiApp />} />
      </Routes>
  );
};

export default AppRoutes;
