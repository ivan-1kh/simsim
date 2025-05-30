import React, { useState, useEffect } from 'react';
import Simsim from './Simsim';

const AnimatedLettersBackground = () => {
  const [letters, setLetters] = useState([]);

  // Arabic and Hebrew letters
  const arabicLetters = ['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'];
  const hebrewLetters = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'ף', 'פ', 'ץ', 'צ', 'ק', 'ר', 'ש', 'ת'];
  const allLetters = [...arabicLetters, ...hebrewLetters];

  // Generate random letter data
  const generateLetter = () => {
    return {
      id: Math.random(),
      letter: allLetters[Math.floor(Math.random() * allLetters.length)],
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 40 + 20, // 20px to 60px
      opacity: 0,
      animationDuration: Math.random() * 3 + 2, // 2s to 5s
      delay: Math.random() * 2,
      color: Math.random() > 0.5 ? 'arabic' : 'hebrew'
    };
  };

  // Initialize letters and set up interval
  useEffect(() => {
    // Create initial letters
    const initialLetters = Array.from({ length: 25 }, generateLetter);
    setLetters(initialLetters);

    // Add new letters periodically
    const interval = setInterval(() => {
      setLetters(currentLetters => {
        // Remove old letters and add new ones
        const newLetters = currentLetters.filter(letter => 
          Date.now() - letter.createdAt < 8000 // Keep letters for 8 seconds
        );
        
        // Add 1-3 new letters
        const lettersToAdd = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < lettersToAdd; i++) {
          newLetters.push({
            ...generateLetter(),
            createdAt: Date.now()
          });
        }
        
        return newLetters.slice(-30); // Keep max 30 letters
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-800 to-slate-900">
      {/* Animated Letters */}
      <div className="absolute inset-0 overflow-hidden">
        {letters.map((letterData) => (
          <div
            key={letterData.id}
            className={`absolute letter ${letterData.color === 'arabic' ? 'arabic-letter' : 'hebrew-letter'}`}
            style={{
              left: `${letterData.x}%`,
              top: `${letterData.y}%`,
              fontSize: `${letterData.size}px`,
              animationDuration: `${letterData.animationDuration}s`,
              animationDelay: `${letterData.delay}s`,
            }}
          >
            {letterData.letter}
          </div>
        ))}
      </div>

      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      {/* Content Area */}
      <div className="relative z-10 min-h-screen flex items-center justify-center" style={{minWidth: "1000px"}}>
            <Simsim />
      </div>

      {/* Custom CSS Animations */}
      <style jsx>{`
        @keyframes fadeInOut {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.8);
          }
          20% { 
            opacity: 0.7;
            transform: translateY(0px) scale(1);
          }
          80% { 
            opacity: 0.7;
            transform: translateY(0px) scale(1);
          }
          100% { 
            opacity: 0;
            transform: translateY(-20px) scale(0.8);
          }
        }

        @keyframes drift {
          0% { transform: translateX(0px); }
          50% { transform: translateX(10px); }
          100% { transform: translateX(0px); }
        }

        @keyframes glow {
          0%, 100% { text-shadow: 0 0 5px rgba(139, 92, 246, 0.3); }
          50% { text-shadow: 0 0 20px rgba(139, 92, 246, 0.6), 0 0 30px rgba(139, 92, 246, 0.4); }
        }

        .letter {
          animation: fadeInOut 4s ease-in-out infinite, drift 6s ease-in-out infinite;
          font-weight: 300;
          user-select: none;
          pointer-events: none;
        }

        .arabic-letter {
          color: rgba(139, 92, 246, 0.6);
          font-family: 'Amiri', 'Traditional Arabic', serif;
          animation: fadeInOut 4s ease-in-out infinite, drift 6s ease-in-out infinite, glow 8s ease-in-out infinite;
        }

        .hebrew-letter {
          color: rgba(6, 182, 212, 0.6);
          font-family: 'Frank Ruehl CLM', 'Times New Roman', serif;
          animation: fadeInOut 4s ease-in-out infinite, drift 6s ease-in-out infinite reverse;
        }

        .letter:nth-child(odd) {
          animation-delay: 0.5s;
        }

        .letter:nth-child(3n) {
          animation-duration: 5s;
          color: rgba(16, 185, 129, 0.5);
        }

        .letter:nth-child(4n) {
          animation-duration: 3s;
          color: rgba(245, 158, 11, 0.5);
        }

        .letter:nth-child(5n) {
          color: rgba(239, 68, 68, 0.4);
          animation: fadeInOut 3.5s ease-in-out infinite, glow 10s ease-in-out infinite;
        }

        /* Responsive font sizes */
        @media (max-width: 768px) {
          .letter {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLettersBackground;