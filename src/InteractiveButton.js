import React, { forwardRef, useRef, useCallback } from 'react';

// Assume you have these audio files in your public folder or accessible via a URL
const hoverSoundFile = '/sounds/hover-chime.mp3'; // Replace with your hover sound file path
const clickSoundFile = '/sounds/click-chime.mp3'; // Replace with your click sound file path

const InteractiveButton = forwardRef(
  ({ children, onMouseEnter, onClick, ...props }, ref) => {
    const hoverAudioRef = useRef(null);
    const clickAudioRef = useRef(null);

    const playSound = (audioRef) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Rewind to the start
        audioRef.current.play().catch(error => {
          // Autoplay was prevented, handle gracefully (e.g., log error)
          console.error("Error playing sound:", error);
        });
      }
    };

    const handleMouseEnter = useCallback(
      (e) => {
        playSound(hoverAudioRef);
        if (onMouseEnter) {
          onMouseEnter(e);
        }
      },
      [onMouseEnter]
    );

    const handleClick = useCallback(
      (e) => {
        playSound(clickAudioRef);
        if (onClick) {
          onClick(e);
        }
      },
      [onClick]
    );

    return (
      <>
        <button
          ref={ref}
          onMouseEnter={handleMouseEnter}
          onClick={handleClick}
          {...props}
        >
          {children}
        </button>
        {/* Audio elements are hidden but available to be played */}
        <audio ref={hoverAudioRef} src={hoverSoundFile} preload="auto" style={{ display: 'none' }} />
        <audio ref={clickAudioRef} src={clickSoundFile} preload="auto" style={{ display: 'none' }} />
      </>
    );
  }
);

InteractiveButton.displayName = 'InteractiveButton';

export default InteractiveButton;
