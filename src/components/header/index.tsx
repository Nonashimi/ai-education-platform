import { LogOut, Globe } from "lucide-react";
import type { FC } from "react";
import { useState, useEffect } from "react";

type Props = {
  isOpen: boolean
}

const LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'kk', name: 'Қазақша', flag: '🇰🇿' },
];

const Header:FC<Props> = ({isOpen}) => {
  const [currentLanguage, setCurrentLanguage] = useState('ru');
  const [showLangMenu, setShowLangMenu] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') || 'ru';
    setCurrentLanguage(savedLang);
  }, []);

  const changeLanguage = (langCode: string) => {
    setCurrentLanguage(langCode);
    localStorage.setItem('app_language', langCode);
    setShowLangMenu(false);
    // Перезагрузить страницу для применения языка
    window.location.reload();
  };

  const currentLang = LANGUAGES.find(l => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <header className={`fixed top-0 ${!isOpen?'left-16':'left-64'} transition-all duration-200 right-0 h-[72px] flex justify-between items-center px-6 py-4 shadow-md bg-white z-50`}>
      {/* Логотип */}
      <div className="text-2xl font-bold">AI Education</div>

      {/* Профиль и логаут */}
      <div className="flex items-center gap-7">
        {/* Выбор языка */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
            title={currentLang.name}
          >
            <Globe size={20} className="text-gray-600" />
            <span className="text-2xl">{currentLang.flag}</span>
          </button>

          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-[60]">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full px-4 py-2 text-left hover:bg-blue-50 transition flex items-center gap-3 ${
                    lang.code === currentLanguage ? 'bg-blue-100 text-blue-700 font-semibold' : ''
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>Profile</div>
        <LogOut className="cursor-pointer hover:text-red-600 transition" />
      </div>
    </header>
  );
};

export default Header;
