import React, { useState, useEffect, useRef } from 'react';
import InteractiveButton from './InteractiveButton'; // Step 1: Import InteractiveButton


export default function Simsim() {
  const [gameMode, setGameMode] = useState(""); // "arabic-to-hebrew", "hebrew-to-arabic", "mix"
  const [gameStarted, setGameStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7); // Changed from 5 to 7
  const [isDragging, setIsDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [totalRounds, setTotalRounds] = useState(20);
  const [gameOver, setGameOver] = useState(false);
  const [currentGameMusic, setCurrentGameMusic] = useState(null);
  const [feedback, setFeedback] = useState(null);


  const [currentWords, setCurrentWords] = useState([]);
  const [selectedWord, setSelectedWord] = useState(null);
  const [gifRender, setGifRender] = useState(null);

  const wordRef = useRef(null);
  const gameContainerRef = useRef(null);
  const lobbyMusicRef = useRef(null);
  const gameMusicRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 }); // Add this ref

  // Initialize lobby music
  useEffect(() => {
    if (lobbyMusicRef.current) {
      lobbyMusicRef.current.volume = 0.3; // Set volume to 30%
      lobbyMusicRef.current.loop = true;
    }
  }, []);

  // Handle music based on game state
  useEffect(() => {
    const playLobbyMusic = () => {
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.play().catch(e => console.log('Lobby music play failed:', e));
      }
    };

    const stopLobbyMusic = () => {
      if (lobbyMusicRef.current) {
        lobbyMusicRef.current.pause();
        lobbyMusicRef.current.currentTime = 0;
      }
    };

    const playGameMusic = () => {
      if (gameMusicRef.current && currentGameMusic) {
        gameMusicRef.current.src = `/sounds/${currentGameMusic}.mp3`;
        gameMusicRef.current.volume = 0.3;
        gameMusicRef.current.loop = true;
        gameMusicRef.current.play().catch(e => console.log('Game music play failed:', e));
      }
    };

    const stopGameMusic = () => {
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    };

    if (!gameMode) {
      // In lobby
      stopGameMusic();
      playLobbyMusic();
    } else if (gameMode && !gameOver) {
      // In game
      stopLobbyMusic();
      if (currentGameMusic) {
        playGameMusic();
      }
    } else if (gameOver) {
      // Game over - stop all music
      stopLobbyMusic();
      stopGameMusic();
    }

    return () => {
      // Cleanup function to stop music when component unmounts or state changes
      stopLobbyMusic();
      stopGameMusic();
    };
  }, [gameMode, gameOver, currentGameMusic]);

  // Initialize game when mode is selected
  useEffect(() => {
    if (gameMode && !gameStarted) {
      // Randomize background music for this game session
      const musicNumber = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      setCurrentGameMusic(musicNumber);
      startGame();
    }
  }, [gameMode, gameStarted]);

  // Main game timer and morph progress
  useEffect(() => {
    if (gameStarted && !feedback && selectedWord !== null && !gameOver) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            clearInterval(interval);
            handleTimeUp();
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [gameStarted, feedback, selectedWord, gameOver]);

  // useEffect(() => {
  //   if (gameStarted && !feedback && selectedWord && !gameOver) {
  //     const interval = setInterval(() => {
  //       setTimeLeft(prev => {
  //         if (prev <= 0.1) {
  //           clearInterval(interval);
  //           handleTimeUp();
  //           return 0;
  //         }
  //         return prev - 0.1;
  //       });
  //     }, 100);

  //     return () => clearInterval(interval);
  //   }
  // }, [gameStarted, feedback, selectedWord, gameOver]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
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

    setCurrentWords([]);

    setFeedback(null);
    setTimeLeft(7); // Changed from 5 to 7

    // Select 4 random words
    const numbers = Array.from({ length: 74 }, (_, i) => i + 1); // [1,2,...,10]

    // Shuffle using Fisher-Yates algorithm
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }

    setCurrentWords(numbers.slice(0, 4)); // First 4 numbers after shuffling


    if (gameMode == "mix") {

      setGifRender(Math.random() < 0.5 ? "ArHb" : "HbAr");

    } else {

      setGifRender(gameMode == "arabic-to-hebrew" ? "ArHb" : "HbAr");
    }

    // Select word 0-3
    setSelectedWord(Math.floor(Math.random() * 4));

    setCurrentRound(prev => prev + 1);
  };

  // Handle when time runs out
  const handleTimeUp = () => {
    setFeedback({
      correct: false,
      message: "Time's up!",
    });

    // Move to next round after delay
    setTimeout(() => {
      startNextRound();
    }, 2000);
  };

  const handleMouseDown = (e) => {
    if (feedback || selectedWord === null || !wordRef.current || !gameContainerRef.current) return;

    setIsDragging(true);
    const wordBoundingRect = wordRef.current.getBoundingClientRect();
    const gameRect = gameContainerRef.current.getBoundingClientRect();

    // Calculate the offset of the mouse click relative to the word element's top-left corner
    const offsetX = e.clientX - wordBoundingRect.left;
    const offsetY = e.clientY - wordBoundingRect.top;
    dragOffsetRef.current = { x: offsetX, y: offsetY };

    // Set the initial drag position of the word's top-left corner
    // relative to the game container, adjusted by the click offset
    setDragPos({
      x: e.clientX - gameRect.left - dragOffsetRef.current.x,
      y: e.clientY - gameRect.top - dragOffsetRef.current.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedWord === null || feedback || !wordRef.current || !gameContainerRef.current) return;

    const gameRect = gameContainerRef.current.getBoundingClientRect();

    // Update drag position based on current mouse position and the initial click offset
    setDragPos({
      x: e.clientX - gameRect.left - dragOffsetRef.current.x,
      y: e.clientY - gameRect.top - dragOffsetRef.current.y
    });
  };

  // Handle drop
  const handleMouseUp = () => {
    if (!isDragging || selectedWord === null || feedback || !wordRef.current) return;
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


    if (selectedWord == quadrantIndex) {

      //RIGHT ANSWER

      // Calculate points based on remaining time
      const pointsEarned = Math.ceil((timeLeft / 7) * 100); // Changed from 5 to 7

      setScore(prev => prev + pointsEarned);

      setFeedback({
        correct: true,
        message: `+${pointsEarned} points!`,
      });

    } else {

      //WRONG ANSDWER
      setFeedback({
        correct: false,
        message: "Incorrect!",
      });
    }

    // Move to next round after delay
    setTimeout(() => {
      startNextRound();
    }, 2000);

    // Reset position
    setDragPos({ x: 0, y: 0 });
  };

  // Reset the game
  const resetGame = () => {
    setGameMode("");
    setGameStarted(false);
    setCurrentRound(0);
    setScore(0);
    setFeedback(null);
    setCurrentWords([]);
    setSelectedWord(null);
    setGameOver(false);
    setTimeLeft(7); // Changed from 5 to 7
    setCurrentGameMusic(null);
  };

  // Render language selection screen
  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        {/* Audio elements */}
        <audio ref={lobbyMusicRef} preload="auto">
          <source src="/sounds/lobby.mp3" type="audio/mpeg" />
        </audio>

        <h1 className="text-3xl font-bold mb-6 text-blue-800">simsim</h1>
        <p className="text-xl mb-8 text-center">Learn Arabic and Hebrew cognates through an interactive word-morphing game!</p>

        <h2 className="text-2xl mb-4">Select Learning Mode:</h2>
        <div className="flex flex-col gap-4 w-64">
          <InteractiveButton
            onClick={() => setGameMode("arabic-to-hebrew")}
            className="game-button"
          >
            Arabic for Hebrew Speakers
          </InteractiveButton>
          <InteractiveButton
            onClick={() => setGameMode("hebrew-to-arabic")}
            className="game-button"
          >
            Hebrew for Arabic Speakers
          </InteractiveButton>
          <InteractiveButton
            onClick={() => setGameMode("mix")}
            className="game-button orange"
          >
            Mix Mode
          </InteractiveButton>
        </div>
      </div>
    );
  }

  // Game over screen
  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-3xl font-bold mb-6 text-blue-800">Game Over!</h1>
        <p className="text-2xl mb-4">Your final score: <span className="font-bold text-green-600">{score}</span></p>
        <p className="text-xl mb-8">Rounds completed: {currentRound > 0 ? currentRound - 1 : 0}/{totalRounds}</p>

        <InteractiveButton
          onClick={resetGame}
          className="game-button"
        >
          Play Again
        </InteractiveButton>
      </div>
    );
  }

  // Main game screen
  return (
    <>
      {/* Header */}
      <div style={{
        backgroundColor: "rgba(0, 0, 255, 0.05)",
        border: "1px solid blue",
        borderRadius: "1rem",
        padding: "1rem",
        position: "absolute",
        top: "1rem",
        left: "1rem",
        width: "30%"

      }}
        className="w-full flex justify-between items-center mb-4">

        <div>
          <p className="text-lg">Round: {currentRound}/{totalRounds}</p>
        </div>

        {/* Game Controls */}
        <div className="mt-auto mb-2 pt-4">
          <InteractiveButton
            onClick={resetGame}
            className="text-blue-600 hover:text-blue-800 py-2 px-4 rounded-md hover:bg-blue-100 transition"
          >
            Reset Game
          </InteractiveButton>
        </div>
        <div className="text-center">
          <h1 className="font-bold text-2xl text-blue-800">simsim</h1>
          <p className="text-sm">
            {gameMode === "arabic-to-hebrew" ? "Arabic for Hebrew Speakers" :
              gameMode === "hebrew-to-arabic" ? "Hebrew for Arabic Speakers" : "Mix Mode"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg">Score: <span className="font-bold text-green-600">{score}</span></p>
        </div>
      </div>

      <div
        ref={gameContainerRef}
        className="relative flex flex-col items-center h-screen p-4 overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}

        style={{
          width: "30%"
        }}
      >
        {/* Audio element for game music */}
        <audio ref={gameMusicRef} preload="auto">
          <source src="" type="audio/mpeg" />
        </audio>


        {/* Timer */}
        <div className="w-full max-w-md h-2 bg-gray-200 rounded-full mb-8"
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-100 ease-linear"
            style={{ width: `${(timeLeft / 7) * 100}%` }} // Changed from 5 to 7
          ></div>
        </div>

        {/* Main Game Area */}
        <div className="relative flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
          {/* Word Container */}
          {selectedWord != null && (
            <div
              ref={wordRef}
              className={`text-5xl font-bold p-6 cursor-grab active:cursor-grabbing rounded-lg shadow-lg bg-white ${isDragging ? 'z-50 opacity-90' : ''}`}
              style={{
                position: isDragging ? 'absolute' : 'relative',
                left: isDragging ? dragPos.x : 'auto',
                top: isDragging ? dragPos.y : 'auto',
                transform: feedback?.correct ? 'scale(1.1)' : feedback?.correct === false ? 'translateX(-5px) translateX(5px)' : 'none',
                transition: isDragging ? 'none' : 'all 0.3s ease',
                userSelect: 'none',
                boxShadow: "none",
                background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 15%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.1) 45%, transparent 55%)"
              }}
              onMouseDown={handleMouseDown}
            >
              <div className="relative" style={{ minWidth: '100px', minHeight: '60px' }}>

                {/* CHECK IF HbAr OR ArHb ******************** */}
                <img
                  src={"words/" + currentWords[selectedWord] + "/" + gifRender + ".gif"}
                  style={{ width: "15rem", userSelect: "none", pointerEvents: "none" }}
                  draggable={false}
                />
              </div>
            </div>
          )}

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 p-3 rounded-lg text-white text-center ${feedback.correct ? 'bg-green-500' : 'bg-red-500'
                }`}
            >
              <p className="text-xl font-bold">{feedback.message}</p>
            </div>
          )}
        </div>

        {/* 4-Photo Grid */}
        {currentWords.length === 4 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-2 grid-rows-2 gap-0">
            {/* Top-left quadrant */}
            <img
              src={"words/" + currentWords[0] + "/photo.jpeg"}
              className="w-full h-full object-cover"
              draggable={false}
              style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
            />

            {/* Top-right quadrant */}
            <img
              src={"words/" + currentWords[1] + "/photo.jpeg"}
              className="w-full h-full object-cover"
              draggable={false}
              style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
            />

            {/* Bottom-left quadrant */}
            <img
              src={"words/" + currentWords[2] + "/photo.jpeg"}
              className="w-full h-full object-cover"
              draggable={false}
              style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
            />

            {/* Bottom-right quadrant */}
            <img
              src={"words/" + currentWords[3] + "/photo.jpeg"}
              className="w-full h-full object-cover"
              draggable={false}
              style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
            />
          </div>
        )}

      </div>
    </>
  );
}







// import React, { useState, useEffect, useRef } from 'react';
// import InteractiveButton from './InteractiveButton'; // Step 1: Import InteractiveButton


// export default function Simsim() {
//   const [gameMode, setGameMode] = useState(""); // "arabic-to-hebrew", "hebrew-to-arabic", "mix"
//   const [gameStarted, setGameStarted] = useState(false);
//   const [currentRound, setCurrentRound] = useState(0);
//   const [score, setScore] = useState(0);
//   const [timeLeft, setTimeLeft] = useState(5);
//   const [isDragging, setIsDragging] = useState(false);
//   const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
//   const [totalRounds, setTotalRounds] = useState(20);
//   const [gameOver, setGameOver] = useState(false);
//   const [currentGameMusic, setCurrentGameMusic] = useState(null);
//   const [feedback, setFeedback] = useState(null);


//   const [currentWords, setCurrentWords] = useState([]);
//   const [selectedWord, setSelectedWord] = useState(null);

//   const wordRef = useRef(null);
//   const gameContainerRef = useRef(null);
//   const lobbyMusicRef = useRef(null);
//   const gameMusicRef = useRef(null);
//   const dragOffsetRef = useRef({ x: 0, y: 0 }); // Add this ref

//   // Initialize lobby music
//   useEffect(() => {
//     if (lobbyMusicRef.current) {
//       lobbyMusicRef.current.volume = 0.3; // Set volume to 30%
//       lobbyMusicRef.current.loop = true;
//     }
//   }, []);

//   // Handle music based on game state
//   useEffect(() => {
//     const playLobbyMusic = () => {
//       if (lobbyMusicRef.current) {
//         lobbyMusicRef.current.play().catch(e => console.log('Lobby music play failed:', e));
//       }
//     };

//     const stopLobbyMusic = () => {
//       if (lobbyMusicRef.current) {
//         lobbyMusicRef.current.pause();
//         lobbyMusicRef.current.currentTime = 0;
//       }
//     };

//     const playGameMusic = () => {
//       if (gameMusicRef.current && currentGameMusic) {
//         gameMusicRef.current.src = `/sounds/${currentGameMusic}.mp3`;
//         gameMusicRef.current.volume = 0.3;
//         gameMusicRef.current.loop = true;
//         gameMusicRef.current.play().catch(e => console.log('Game music play failed:', e));
//       }
//     };

//     const stopGameMusic = () => {
//       if (gameMusicRef.current) {
//         gameMusicRef.current.pause();
//         gameMusicRef.current.currentTime = 0;
//       }
//     };

//     if (!gameMode) {
//       // In lobby
//       stopGameMusic();
//       playLobbyMusic();
//     } else if (gameMode && !gameOver) {
//       // In game
//       stopLobbyMusic();
//       if (currentGameMusic) {
//         playGameMusic();
//       }
//     } else if (gameOver) {
//       // Game over - stop all music
//       stopLobbyMusic();
//       stopGameMusic();
//     }

//     return () => {
//       // Cleanup function to stop music when component unmounts or state changes
//       stopLobbyMusic();
//       stopGameMusic();
//     };
//   }, [gameMode, gameOver, currentGameMusic]);

//   // Initialize game when mode is selected
//   useEffect(() => {
//     if (gameMode && !gameStarted) {
//       // Randomize background music for this game session
//       const musicNumber = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
//       setCurrentGameMusic(musicNumber);
//       startGame();
//     }
//   }, [gameMode, gameStarted]);

//   // Main game timer and morph progress
//   useEffect(() => {
//     if (gameStarted && !feedback && selectedWord !== null && !gameOver) {
//       const interval = setInterval(() => {
//         setTimeLeft(prev => {
//           if (prev <= 0.1) {
//             clearInterval(interval);
//             handleTimeUp();
//             return 0;
//           }
//           return prev - 0.1;
//         });
//       }, 100);

//       return () => clearInterval(interval);
//     }
//   }, [gameStarted, feedback, selectedWord, gameOver]);

//   // useEffect(() => {
//   //   if (gameStarted && !feedback && selectedWord && !gameOver) {
//   //     const interval = setInterval(() => {
//   //       setTimeLeft(prev => {
//   //         if (prev <= 0.1) {
//   //           clearInterval(interval);
//   //           handleTimeUp();
//   //           return 0;
//   //         }
//   //         return prev - 0.1;
//   //       });
//   //     }, 100);

//   //     return () => clearInterval(interval);
//   //   }
//   // }, [gameStarted, feedback, selectedWord, gameOver]);

//   // Start the game
//   const startGame = () => {
//     setGameStarted(true);
//     setScore(0);
//     setCurrentRound(0);
//     setGameOver(false);
//     startNextRound();
//   };

//   // Set up the next round
//   const startNextRound = () => {

//     if (currentRound >= totalRounds) {
//       setGameOver(true);
//       return;
//     }

//     setCurrentWords([]);

//     setFeedback(null);
//     setTimeLeft(5);

//     // Select 4 random words
//     const numbers = Array.from({ length: 74 }, (_, i) => i + 1); // [1,2,...,10]

//     // Shuffle using Fisher-Yates algorithm
//     for (let i = numbers.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
//     }

//     setCurrentWords(numbers.slice(0, 4)); // First 4 numbers after shuffling


//     // Select word 0-3
//     setSelectedWord(Math.floor(Math.random() * 4));

//     setCurrentRound(prev => prev + 1);
//   };

//   // Handle when time runs out
//   const handleTimeUp = () => {
//     setFeedback({
//       correct: false,
//       message: "Time's up!",
//     });

//     // Move to next round after delay
//     setTimeout(() => {
//       startNextRound();
//     }, 2000);
//   };

//   const handleMouseDown = (e) => {
//     if (feedback || selectedWord === null || !wordRef.current || !gameContainerRef.current) return;

//     setIsDragging(true);
//     const wordBoundingRect = wordRef.current.getBoundingClientRect();
//     const gameRect = gameContainerRef.current.getBoundingClientRect();

//     // Calculate the offset of the mouse click relative to the word element's top-left corner
//     const offsetX = e.clientX - wordBoundingRect.left;
//     const offsetY = e.clientY - wordBoundingRect.top;
//     dragOffsetRef.current = { x: offsetX, y: offsetY };

//     // Set the initial drag position of the word's top-left corner
//     // relative to the game container, adjusted by the click offset
//     setDragPos({
//       x: e.clientX - gameRect.left - dragOffsetRef.current.x,
//       y: e.clientY - gameRect.top - dragOffsetRef.current.y
//     });
//   };

//   const handleMouseMove = (e) => {
//     if (!isDragging || selectedWord === null || feedback || !wordRef.current || !gameContainerRef.current) return;

//     const gameRect = gameContainerRef.current.getBoundingClientRect();

//     // Update drag position based on current mouse position and the initial click offset
//     setDragPos({
//       x: e.clientX - gameRect.left - dragOffsetRef.current.x,
//       y: e.clientY - gameRect.top - dragOffsetRef.current.y
//     });
//   };

//   // Handle drop
//   const handleMouseUp = () => {
//     if (!isDragging || selectedWord === null || feedback || !wordRef.current) return;
//     setIsDragging(false);

//     // Check which corner the word was dropped in
//     const gameRect = gameContainerRef.current.getBoundingClientRect();
//     const centerX = dragPos.x + wordRef.current.offsetWidth / 2;
//     const centerY = dragPos.y + wordRef.current.offsetHeight / 2;

//     // Determine which quadrant
//     const isRight = centerX > gameRect.width / 2;
//     const isBottom = centerY > gameRect.height / 2;



//     let quadrantIndex;
//     if (!isRight && !isBottom) quadrantIndex = 0; // Top-left
//     else if (isRight && !isBottom) quadrantIndex = 1; // Top-right
//     else if (!isRight && isBottom) quadrantIndex = 2; // Bottom-left
//     else quadrantIndex = 3; // Bottom-right


//     if (selectedWord == quadrantIndex) {

//       //RIGHT ANSWER

//       // Calculate points based on remaining time
//       const pointsEarned = Math.ceil((timeLeft / 5) * 100);

//       setScore(prev => prev + pointsEarned);

//       setFeedback({
//         correct: true,
//         message: `+${pointsEarned} points!`,
//       });

//     } else {

//       //WRONG ANSDWER
//       setFeedback({
//         correct: false,
//         message: "Incorrect!",
//       });
//     }

//     // Move to next round after delay
//     setTimeout(() => {
//       startNextRound();
//     }, 2000);

//     // Reset position
//     setDragPos({ x: 0, y: 0 });
//   };

//   // Reset the game
//   const resetGame = () => {
//     setGameMode("");
//     setGameStarted(false);
//     setCurrentRound(0);
//     setScore(0);
//     setFeedback(null);
//     setCurrentWords([]);
//     setSelectedWord(null);
//     setGameOver(false);
//     setTimeLeft(5);
//     setCurrentGameMusic(null);
//   };

//   // Render language selection screen
//   if (!gameMode) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen p-4">
//         {/* Audio elements */}
//         <audio ref={lobbyMusicRef} preload="auto">
//           <source src="/sounds/lobby.mp3" type="audio/mpeg" />
//         </audio>

//         <h1 className="text-3xl font-bold mb-6 text-blue-800">simsim</h1>
//         <p className="text-xl mb-8 text-center">Learn Arabic and Hebrew cognates through an interactive word-morphing game!</p>

//         <h2 className="text-2xl mb-4">Select Learning Mode:</h2>
//         <div className="flex flex-col gap-4 w-64">
//           <InteractiveButton
//             onClick={() => setGameMode("arabic-to-hebrew")}
//             className="game-button"
//           >
//             Arabic for Hebrew Speakers
//           </InteractiveButton>
//           <InteractiveButton
//             onClick={() => setGameMode("hebrew-to-arabic")}
//             className="game-button"
//           >
//             Hebrew for Arabic Speakers
//           </InteractiveButton>
//           <InteractiveButton
//             onClick={() => setGameMode("mix")}
//             className="game-button orange"
//           >
//             Mix Mode
//           </InteractiveButton>
//         </div>
//       </div>
//     );
//   }

//   // Game over screen
//   if (gameOver) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen p-4">
//         <h1 className="text-3xl font-bold mb-6 text-blue-800">Game Over!</h1>
//         <p className="text-2xl mb-4">Your final score: <span className="font-bold text-green-600">{score}</span></p>
//         <p className="text-xl mb-8">Rounds completed: {currentRound > 0 ? currentRound - 1 : 0}/{totalRounds}</p>

//         <InteractiveButton
//           onClick={resetGame}
//           className="game-button"
//         >
//           Play Again
//         </InteractiveButton>
//       </div>
//     );
//   }

//   // Main game screen
//   return (
//     <>
//       {/* Header */}
//       <div style={{
//         backgroundColor: "rgba(0, 0, 255, 0.05)",
//         border: "1px solid blue",
//         borderRadius: "1rem",
//         padding: "1rem",
//         position: "absolute",
//         top: "1rem",
//         left: "1rem",
//         width: "30%"

//       }}
//         className="w-full flex justify-between items-center mb-4">

//         <div>
//           <p className="text-lg">Round: {currentRound}/{totalRounds}</p>
//         </div>

//         {/* Game Controls */}
//         <div className="mt-auto mb-2 pt-4">
//           <InteractiveButton
//             onClick={resetGame}
//             className="text-blue-600 hover:text-blue-800 py-2 px-4 rounded-md hover:bg-blue-100 transition"
//           >
//             Reset Game
//           </InteractiveButton>
//         </div>
//         <div className="text-center">
//           <h1 className="font-bold text-2xl text-blue-800">simsim</h1>
//           <p className="text-sm">
//             {gameMode === "arabic-to-hebrew" ? "Arabic for Hebrew Speakers" :
//               gameMode === "hebrew-to-arabic" ? "Hebrew for Arabic Speakers" : "Mix Mode"}
//           </p>
//         </div>
//         <div className="text-right">
//           <p className="text-lg">Score: <span className="font-bold text-green-600">{score}</span></p>
//         </div>
//       </div>

//       <div
//         ref={gameContainerRef}
//         className="relative flex flex-col items-center h-screen p-4 overflow-hidden"
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//         onMouseLeave={handleMouseUp}

//         style={{
//           width: "30%"
//         }}
//       >
//         {/* Audio element for game music */}
//         <audio ref={gameMusicRef} preload="auto">
//           <source src="" type="audio/mpeg" />
//         </audio>


//         {/* Timer */}
//         <div className="w-full max-w-md h-2 bg-gray-200 rounded-full mb-8"
//         >
//           <div
//             className="h-full bg-blue-600 rounded-full transition-all duration-100 ease-linear"
//             style={{ width: `${(timeLeft / 5) * 100}%` }}
//           ></div>
//         </div>

//         {/* Main Game Area */}
//         <div className="relative flex-1 w-full max-w-2xl flex flex-col items-center justify-center">
//           {/* Word Container */}
//           {selectedWord != null && (
//             <div
//               ref={wordRef}
//               className={`text-5xl font-bold p-6 cursor-grab active:cursor-grabbing rounded-lg shadow-lg bg-white ${isDragging ? 'z-50 opacity-90' : ''}`}
//               style={{
//                 position: isDragging ? 'absolute' : 'relative',
//                 left: isDragging ? dragPos.x : 'auto',
//                 top: isDragging ? dragPos.y : 'auto',
//                 transform: feedback?.correct ? 'scale(1.1)' : feedback?.correct === false ? 'translateX(-5px) translateX(5px)' : 'none',
//                 transition: isDragging ? 'none' : 'all 0.3s ease',
//                 userSelect: 'none',
//                 boxShadow: "none",
//                 background: "radial-gradient(circle at center, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.7) 15%, rgba(0, 0, 0, 0.4) 30%, rgba(0, 0, 0, 0.1) 45%, transparent 55%)"
//               }}
//               onMouseDown={handleMouseDown}
//             >
//               <div className="relative" style={{ minWidth: '100px', minHeight: '60px' }}>

//                 {/* CHECK IF HbAr OR ArHb ******************** */}
//                 <img
//                   src={"words/" + currentWords[selectedWord] + "/" + ( gameMode == "arabic-to-hebrew" ? "ArHb" : "HbAr") + ".gif"}
//                   style={{ width: "15rem", userSelect: "none", pointerEvents: "none" }}
//                   draggable={false}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Feedback */}
//           {feedback && (
//             <div
//               className={`mt-4 p-3 rounded-lg text-white text-center ${feedback.correct ? 'bg-green-500' : 'bg-red-500'
//                 }`}
//             >
//               <p className="text-xl font-bold">{feedback.message}</p>
//             </div>
//           )}
//         </div>

//         {/* 4-Photo Grid */}
//         {currentWords.length === 4 && (
//           <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-2 grid-rows-2 gap-0">
//             {/* Top-left quadrant */}
//             <img
//               src={"words/" + currentWords[0] + "/photo.jpeg"}
//               className="w-full h-full object-cover"
//               draggable={false}
//               style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
//             />

//             {/* Top-right quadrant */}
//             <img
//               src={"words/" + currentWords[1] + "/photo.jpeg"}
//               className="w-full h-full object-cover"
//               draggable={false}
//               style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
//             />

//             {/* Bottom-left quadrant */}
//             <img
//               src={"words/" + currentWords[2] + "/photo.jpeg"}
//               className="w-full h-full object-cover"
//               draggable={false}
//               style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
//             />

//             {/* Bottom-right quadrant */}
//             <img
//               src={"words/" + currentWords[3] + "/photo.jpeg"}
//               className="w-full h-full object-cover"
//               draggable={false}
//               style={{ zIndex: "-100", objectFit: "fill", pointerEvents: "none", userSelect: "none" }}
//             />
//           </div>
//         )}

//       </div>
//     </>
//   );
// }
