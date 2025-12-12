import { useState, useEffect, useRef } from "react";
import { SendHorizonal, Bot, User, Loader2 } from "lucide-react";
import { api } from "../../services/api";

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Привет! Я твой AI-ассистент. Чем могу помочь?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Генерация или получение user_id
  const userId = useRef(localStorage.getItem('user_id') || `user_${Date.now()}`);

  useEffect(() => {
    localStorage.setItem('user_id', userId.current);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMessage = { sender: "user", text: userMessage };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Реальный запрос к Backend API
      const response = await api.chat.sendMessage({
        user_id: userId.current,
        message: userMessage,
        language: 'ru',
      });

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.response },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Извините, произошла ошибка. Убедитесь, что backend сервер запущен на http://localhost:8000"
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Автопрокрутка вниз при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Область сообщений */}
      <main className="h-full flex flex-col flex-1 p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-2 ${
              msg.sender === "user" ? "justify-end" : ""
            }`}
          >
            {msg.sender === "bot" && (
              <div className="p-2 bg-blue-600 rounded-full text-white">
                <Bot size={18} />
              </div>
            )}
            <div
              className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {msg.text}
            </div>
            {msg.sender === "user" && (
              <div className="p-2 bg-blue-600 rounded-full text-white">
                <User size={18} />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Футер фиксированный внизу */}
      <footer className="p-4 bg-white border-t flex items-center gap-2 sticky bottom-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !isLoading && handleSend()}
          placeholder="Введите сообщение..."
          disabled={isLoading}
          className="flex-1 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizonal size={18} />}
        </button>
      </footer>
    </div>
  );
};

export default Chat;
