import { useState, useEffect, useRef } from 'react';

// Sample cognate data
const cognateWords = [
  {
    source_word: "سلام",
    target_word: "שלום",
    concept: "peace",
    hint: "This word for 'peace' has the same Semitic root in both languages."
  },
  {
    source_word: "كتاب",
    target_word: "ספר",
    concept: "book",
    hint: "The word for 'book' shows shared literary traditions."
  },
  {
    source_word: "مدرسة",
    target_word: "בית־ספר",
    concept: "school",
    hint: "Places of learning share linguistic connections."
  },
  {
    source_word: "نبيذ",
    target_word: "יין",
    concept: "wine",
    hint: "This beverage has cultural significance in both traditions."
  },
  {
    source_word: "بيت",
    target_word: "בית",
    concept: "house",
    hint: "The word for 'house' is almost identical in both languages."
  },
  {
    source_word: "ماء",
    target_word: "מים",
    concept: "water",
    hint: "This essential element shares linguistic roots."
  },
  {
    source_word: "قمر",
    target_word: "ירח",
    concept: "moon",
    hint: "Look up at night to see this shared celestial body."
  },
  {
    source_word: "شمس",
    target_word: "שמש",
    concept: "sun",
    hint: "The bright star at the center of our solar system."
  }
];

// Mock image placeholders for concepts
const conceptImages = {
  "peace": "/api/placeholder/150/150",
  "book": "/api/placeholder/150/150",
  "school": "/api/placeholder/150/150",
  "wine": "/api/placeholder/150/150",
  "house": "/api/placeholder/150/150",
  "water": "/api/placeholder/150/150",
  "moon": "/api/placeholder/150/150",
  "sun": "/api/placeholder/150/150"
};

export default function ScriptMorphGame() {
  const [gameMode, setGameMode] = useState(""); // "arabic-to-hebrew", "hebrew-to-arabic", "mix"
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [morphProgress, setMorphProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5);
  const [currentWord, setCurrentWord] = useState(null);
  const [answerOptions, setAnswerOptions] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [showHint, setShowHint] = useState(false);
  const [totalRounds, setTotalRounds] = useState(10);
  const [gameOver, setGameOver] = useState(false);

  const wordRef = useRef(null);
  const timerRef = useRef(null);
  const gameContainerRef = useRef(null);

  // Initialize game when mode is selected
  useEffect(() => {
    if (gameMode && !gameStarted) {
      startGame();
    }
  }, [gameMode]);

  // Main game timer and morph progress
  useEffect(() => {
    if (gameStarted && !feedback && currentWord && !gameOver) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prev - 0.1;
        });

        setMorphProgress(prev => Math.min(prev + 2, 100));
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameStarted, feedback, currentWord, gameOver]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCombo(0);
    setCurrentRound(0);
    setGameOver(false);
    startNextRound();
  };

  // Set up the next round
  const startNextRound = () => {
    if (currentRound >= totalRounds) {
      setGameOver(true);
      return;
    }

    setFeedback(null);
    setShowHint(false);
    setMorphProgress(0);
    setTimeLeft(5);

    // Select current word
    const wordIndex = Math.floor(Math.random() * cognateWords.length);
    const selectedWord = cognateWords[wordIndex];
    setCurrentWord(selectedWord);

    // Create answer options (1 correct, 3 random)
    const correctConcept = selectedWord.concept;
    const otherConcepts = cognateWords
      .filter(word => word.concept !== correctConcept)
      .map(word => word.concept);

    // Shuffle and take 3 distractors
    const shuffled = otherConcepts.sort(() => 0.5 - Math.random());
    const distractors = shuffled.slice(0, 3);

    // Combine and shuffle all options
    const options = [correctConcept, ...distractors].sort(() => 0.5 - Math.random());
    setAnswerOptions(options);

    setCurrentRound(prev => prev + 1);
  };

  // Handle when time runs out
  const handleTimeUp = () => {
    setFeedback({
      correct: false,
      message: "Time's up!",
    });
    setCombo(0);
    setShowHint(true);

    // Move to next round after delay
    setTimeout(() => {
      startNextRound();
    }, 2000);
  };

  // Handle drag start
  const handleMouseDown = (e) => {
    if (feedback || !currentWord) return;

    setIsDragging(true);
    const rect = wordRef.current.getBoundingClientRect();
    const gameRect = gameContainerRef.current.getBoundingClientRect();

    setDragPos({
      x: e.clientX - gameRect.left - rect.width / 2,
      y: e.clientY - gameRect.top - rect.height / 2
    });
  };

  // Handle dragging
  const handleMouseMove = (e) => {
    if (!isDragging || feedback) return;

    const gameRect = gameContainerRef.current.getBoundingClientRect();
    setDragPos({
      x: e.clientX - gameRect.left - wordRef.current.offsetWidth / 2,
      y: e.clientY - gameRect.top - wordRef.current.offsetHeight / 2
    });
  };

  // Handle drop
  const handleMouseUp = () => {
    if (!isDragging || feedback) return;
    setIsDragging(false);

    // Check which corner the word was dropped in
    const gameRect = gameContainerRef.current.getBoundingClientRect();
    const centerX = dragPos.x + wordRef.current.offsetWidth / 2;
    const centerY = dragPos.y + wordRef.current.offsetHeight / 2;

    // Determine which quadrant
    const isRight = centerX > gameRect.width / 2;
    const isBottom = centerY > gameRect.height / 2;

    let quadrantIndex;
    if (!isRight && !isBottom) quadrantIndex = 0; // Top-left
    else if (isRight && !isBottom) quadrantIndex = 1; // Top-right
    else if (!isRight && isBottom) quadrantIndex = 2; // Bottom-left
    else quadrantIndex = 3; // Bottom-right

    checkAnswer(answerOptions[quadrantIndex]);

    // Reset position
    setDragPos({ x: 0, y: 0 });
  };

  // Check if answer is correct
  const checkAnswer = (selectedConcept) => {
    const isCorrect = selectedConcept === currentWord.concept;

    if (isCorrect) {
      // Calculate points based on remaining time
      const timeBonus = Math.ceil((timeLeft / 5) * 100);
      const comboMultiplier = 1 + (combo * 0.1);
      const pointsEarned = Math.ceil(timeBonus * comboMultiplier);

      setScore(prev => prev + pointsEarned);
      setCombo(prev => prev + 1);

      setFeedback({
        correct: true,
        message: `+${pointsEarned} points! ${combo > 0 ? `${combo + 1}x combo!` : ''}`,
      });
    } else {
      setCombo(0);
      setFeedback({
        correct: false,
        message: "Incorrect!",
      });
      setShowHint(true);
    }

    // Move to next round after delay
    setTimeout(() => {
      startNextRound();
    }, 2000);
  };

  // Reset the game
  const resetGame = () => {
    setGameMode("");
    setGameStarted(false);
    setCurrentRound(0);
    setScore(0);
    setCombo(0);
    setFeedback(null);
    setCurrentWord(null);
    setShowHint(false);
    setGameOver(false);
  };

  // Get words based on mode
  const getSourceWord = () => {
    if (!currentWord) return "";

    if (gameMode === "arabic-to-hebrew") {
      return currentWord.target_word; // Hebrew
    } else if (gameMode === "hebrew-to-arabic") {
      return currentWord.source_word; // Arabic
    } else {
      // Mix mode - randomly choose
      return currentRound % 2 === 0 ? currentWord.source_word : currentWord.target_word;
    }
  };

  const getTargetWord = () => {
    if (!currentWord) return "";

    if (gameMode === "arabic-to-hebrew") {
      return currentWord.source_word; // Arabic
    } else if (gameMode === "hebrew-to-arabic") {
      return currentWord.target_word; // Hebrew
    } else {
      // Mix mode - opposite of source
      return currentRound % 2 === 0 ? currentWord.target_word : currentWord.source_word;
    }
  };

  // Determine text directions
  const getSourceDir = () => {
    if (!gameMode) return "rtl";

    if (gameMode === "arabic-to-hebrew") {
      return "rtl"; // Hebrew is RTL
    } else if (gameMode === "hebrew-to-arabic") {
      return "rtl"; // Arabic is RTL
    } else {
      // Mix mode
      return "rtl"; // Both are RTL
    }
  };

  // Render language selection screen
  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50 p-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">ScriptMorph</h1>
        <p className="text-xl mb-8 text-center">Learn Arabic and Hebrew cognates through an interactive word-morphing game!</p>

        <h2 className="text-2xl mb-4">Select Learning Mode:</h2>
        <div className="flex flex-col gap-4 w-64">
          <button
            onClick={() => setGameMode("arabic-to-hebrew")}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Arabic for Hebrew Speakers
          </button>
          <button
            onClick={() => setGameMode("hebrew-to-arabic")}
            className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition"
          >
            Hebrew for Arabic Speakers
          </button>
          <button
            onClick={() => setGameMode("mix")}
            className="bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
          >
            Mix Mode
          </button>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-blue-50 p-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Game Over!</h1>
        <p className="text-2xl mb-4">Your final score: <span className="font-bold text-green-600">{score}</span></p>
        <p className="text-xl mb-8">Rounds completed: {currentRound - 1}/{totalRounds}</p>

        <button
          onClick={resetGame}
          className="bg-blue-600 text-white p-3 px-6 rounded-lg hover:bg-blue-700 transition"
        >
          Play Again
        </button>
      </div>
    );
  }

  // Main game screen
  return (
    <div
      ref={gameContainerRef}
      className="relative flex flex-col items-center h-screen bg-blue-50 p-4 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-4">
        <div>
          <p className="text-lg">Round: {currentRound}/{totalRounds}</p>
        </div>
        <div className="text-center">
          <h1 className="font-bold text-2xl text-blue-800">ScriptMorph</h1>
          <p className="text-sm">
            {gameMode === "arabic-to-hebrew" ? "Arabic for Hebrew Speakers" :
              gameMode === "hebrew-to-arabic" ? "Hebrew for Arabic Speakers" : "Mix Mode"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg">Score: <span className="font-bold text-green-600">{score}</span></p>
          {combo > 0 && <p className="text-sm text-orange-500">{combo}x combo!</p>}
        </div>
      </div>

      {/* Timer */}
      <div className="w-full max-w-md h-2 bg-gray-200 rounded-full mb-8">
        <div
          className="h-full bg-blue-600 rounded-full transition-all"
          style={{ width: `${(timeLeft / 5) * 100}%` }}
        ></div>
      </div>

      {/* Main Game Area */}
      <div className="relative flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
        {/* Word Container */}
        <div
          ref={wordRef}
          className={`text-5xl font-bold p-6 cursor-grab active:cursor-grabbing rounded-lg shadow-lg bg-white ${isDragging ? 'z-50 opacity-90' : ''}`}
          style={{
            position: isDragging ? 'absolute' : 'relative',
            left: isDragging ? dragPos.x : 'auto',
            top: isDragging ? dragPos.y : 'auto',
            direction: getSourceDir(),
            transform: feedback?.correct ? 'scale(1.1)' : feedback ? 'translateX(-5px) translateX(5px)' : 'none',
            border: feedback?.correct ? '2px solid green' : feedback ? '2px solid red' : 'none',
            transition: isDragging ? 'none' : 'all 0.3s ease'
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="relative">
            {/* Source Word (gradually appears) */}
            <span
              style={{
                opacity: morphProgress / 100,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
              }}
            >
              {getSourceWord()}
            </span>

            {/* Target Word (gradually fades) */}
            <span
              style={{
                opacity: 1 - (morphProgress / 100)
              }}
            >
              {getTargetWord()}
            </span>
          </div>
        </div>

        {/* Feedback */}
        {feedback && (
          <div
            className={`mt-4 p-3 rounded-lg text-white text-center ${feedback.correct ? 'bg-green-500' : 'bg-red-500'
              }`}
          >
            <p className="text-xl font-bold">{feedback.message}</p>
          </div>
        )}

        {/* Hint */}
        {showHint && (
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-center">
              <span className="font-bold">Hint:</span> {currentWord.hint}
            </p>
            <p className="text-center mt-1">
              The correct answer was: <span className="font-bold">{currentWord.concept}</span>
            </p>
          </div>
        )}

        {/* Instructions */}
        {!feedback && !showHint && (
          <p className="mt-4 text-gray-600 text-center">
            Drag the word to the corner showing its meaning
          </p>
        )}
      </div>

      {/* Corner Options */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        {/* Top-left */}
        <div className="absolute top-4 left-4 w-32 h-32 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={conceptImages[answerOptions[0]]}
              alt={answerOptions[0] || ""}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center bg-white px-2 py-1 rounded shadow-sm">
            {answerOptions[0]}
          </p>
        </div>

        {/* Top-right */}
        <div className="absolute top-4 right-4 w-32 h-32 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={conceptImages[answerOptions[1]]}
              alt={answerOptions[1] || ""}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center bg-white px-2 py-1 rounded shadow-sm">
            {answerOptions[1]}
          </p>
        </div>

        {/* Bottom-left */}
        <div className="absolute bottom-4 left-4 w-32 h-32 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={conceptImages[answerOptions[2]]}
              alt={answerOptions[2] || ""}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center bg-white px-2 py-1 rounded shadow-sm">
            {answerOptions[2]}
          </p>
        </div>

        {/* Bottom-right */}
        <div className="absolute bottom-4 right-4 w-32 h-32 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={conceptImages[answerOptions[3]]}
              alt={answerOptions[3] || ""}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="mt-1 text-center bg-white px-2 py-1 rounded shadow-sm">
            {answerOptions[3]}
          </p>
        </div>
      </div>

      {/* Game Controls */}
      <div className="mt-4 mb-2">
        <button
          onClick={resetGame}
          className="text-blue-600 hover:text-blue-800"
        >
          Reset Game
        </button>
      </div>
    </div>
  );
}