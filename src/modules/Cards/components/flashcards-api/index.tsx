import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
import { Loader2, BookOpen, CheckCircle, XCircle } from "lucide-react";
import { api, type TopicInfo, type FlashcardResponse } from "../../../../services/api";

type Mode = "deck_select" | "study" | "results";

const FlashcardsApiApp = () => {
  const [mode, setMode] = useState<Mode>("deck_select");
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deckId, setDeckId] = useState<string | null>(null);
  const [cards, setCards] = useState<FlashcardResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<number[]>([]);
  const [learningCards, setLearningCards] = useState<number[]>([]);
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicInfo | null>(null);
  const toast = useRef<Toast>(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id") || `user_${Date.now()}`;

  useEffect(() => {
    localStorage.setItem("user_id", userId);
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setIsLoading(true);
      const data = await api.flashcards.getTopics("ru");
      setTopics(data.topics || []);
    } catch (err) {
      console.error("Error loading topics:", err);
      toast.current?.show({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось загрузить темы",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDeck = async (topic: TopicInfo, difficulty: "easy" | "medium" | "hard") => {
    try {
      setIsLoading(true);
      setShowDifficultyDialog(false);

      const response = await api.flashcards.generateDeck({
        user_id: userId,
        mode: "topic_select",
        topic: topic.full_name,
        num_cards: 20,
        difficulty,
        language: "ru",
      });

      setDeckId(response.deck_id);

      // Загрузить все карточки
      const loadedCards: FlashcardResponse[] = [];
      for (let i = 0; i < response.total_cards; i++) {
        const card = await api.flashcards.getCard(response.deck_id, i);
        loadedCards.push(card);
      }

      setCards(loadedCards);
      setMode("study");
      setCurrentIndex(0);
      setFlipped(false);

      toast.current?.show({
        severity: "success",
        summary: "Успешно",
        detail: `Создана колода из ${response.total_cards} карточек`,
      });
    } catch (err) {
      console.error("Error generating deck:", err);
      toast.current?.show({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось создать колоду",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (topic: TopicInfo) => {
    setSelectedTopic(topic);
    setShowDifficultyDialog(true);
  };

  const reviewCard = async (knewIt: boolean) => {
    if (!deckId) return;

    try {
      await api.flashcards.reviewCard({
        deck_id: deckId,
        card_index: currentIndex,
        knew_it: knewIt,
      });

      if (knewIt) {
        setKnownCards((prev) => [...prev, currentIndex]);
      } else {
        setLearningCards((prev) => [...prev, currentIndex]);
      }

      // Следующая карточка
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
      } else {
        // Завершить сессию
        await completeSession();
      }
    } catch (err) {
      console.error("Error reviewing card:", err);
      toast.current?.show({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось сохранить ответ",
      });
    }
  };

  const completeSession = async () => {
    if (!deckId) return;

    try {
      const result = await api.flashcards.completeSession(deckId, userId);

      toast.current?.show({
        severity: "success",
        summary: "Сессия завершена",
        detail: `Освоено: ${result.known} из ${result.total_cards}`,
      });

      setMode("results");
    } catch (err) {
      console.error("Error completing session:", err);
      toast.current?.show({
        severity: "error",
        summary: "Ошибка",
        detail: "Не удалось завершить сессию",
      });
    }
  };

  const restart = () => {
    setMode("deck_select");
    setDeckId(null);
    setCards([]);
    setCurrentIndex(0);
    setKnownCards([]);
    setLearningCards([]);
    loadTopics();
  };

  if (isLoading && mode === "deck_select") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-indigo-100 flex flex-col items-center p-8">
      <Toast ref={toast} />
      <h1 className="text-5xl font-extrabold text-indigo-700 mb-10 drop-shadow-sm">
        Flashcards - AI Карточки
      </h1>

      {/* Выбор темы */}
      {mode === "deck_select" && (
        <div className="w-full max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Выберите тему для изучения
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                onClick={() => handleTopicSelect(topic)}
                className="bg-white shadow-lg hover:shadow-xl border border-gray-200 rounded-2xl p-6 cursor-pointer transition transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BookOpen size={24} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">{topic.name}</h3>
                    <p className="text-sm text-gray-500">{topic.subject}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {topics.length === 0 && (
            <div className="text-center text-gray-500 mt-10">
              <p>Темы не найдены. Загрузите материалы через backend.</p>
            </div>
          )}
        </div>
      )}

      {/* Изучение карточек */}
      {mode === "study" && cards.length > 0 && (
        <div className="w-full max-w-2xl">
          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Карточка {currentIndex + 1} / {cards.length}
            </p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
              />
            </div>
          </div>

          <div
            onClick={() => setFlipped(!flipped)}
            className="cursor-pointer w-full min-h-[400px] flex items-center justify-center bg-white border-2 border-indigo-200 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 p-8"
          >
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">
                {flipped ? "Определение" : "Термин"}
              </p>
              <p className="text-3xl font-semibold text-indigo-700">
                {flipped ? cards[currentIndex].definition : cards[currentIndex].term}
              </p>
              {flipped && cards[currentIndex].example && (
                <p className="text-gray-600 mt-6 italic">
                  Пример: {cards[currentIndex].example}
                </p>
              )}
            </div>
          </div>

          {flipped && (
            <div className="flex gap-4 mt-6 justify-center">
              <button
                onClick={() => reviewCard(false)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold"
              >
                <XCircle size={20} />
                Не знал
              </button>
              <button
                onClick={() => reviewCard(true)}
                className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition font-semibold"
              >
                <CheckCircle size={20} />
                Знал
              </button>
            </div>
          )}
        </div>
      )}

      {/* Результаты */}
      {mode === "results" && (
        <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Сессия завершена!
          </h2>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="text-gray-700 font-medium">Освоено:</span>
              <span className="text-2xl font-bold text-green-600">
                {knownCards.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg">
              <span className="text-gray-700 font-medium">Изучаю:</span>
              <span className="text-2xl font-bold text-yellow-600">
                {learningCards.length}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <span className="text-gray-700 font-medium">Всего карточек:</span>
              <span className="text-2xl font-bold text-blue-600">{cards.length}</span>
            </div>
          </div>

          <div className="text-center">
            <p className="text-5xl font-bold text-indigo-600 mb-2">
              {Math.round((knownCards.length / cards.length) * 100)}%
            </p>
            <p className="text-gray-600 mb-6">Процент освоения</p>
          </div>

          <button
            onClick={restart}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
          >
            Изучить новую тему
          </button>
        </div>
      )}

      {/* Диалог выбора сложности */}
      <Dialog
        header="Выберите сложность"
        visible={showDifficultyDialog}
        style={{ width: "25rem" }}
        onHide={() => setShowDifficultyDialog(false)}
      >
        <div className="flex flex-col gap-3">
          <Button
            label="Легко"
            className="bg-green-500 text-white hover:bg-green-600 border-none"
            onClick={() => selectedTopic && generateDeck(selectedTopic, "easy")}
          />
          <Button
            label="Средне"
            className="bg-blue-500 text-white hover:bg-blue-600 border-none"
            onClick={() => selectedTopic && generateDeck(selectedTopic, "medium")}
          />
          <Button
            label="Сложно"
            className="bg-red-500 text-white hover:bg-red-600 border-none"
            onClick={() => selectedTopic && generateDeck(selectedTopic, "hard")}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default FlashcardsApiApp;
