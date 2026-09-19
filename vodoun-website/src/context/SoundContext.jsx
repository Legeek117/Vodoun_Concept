/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { Howl } from 'howler';

const SoundContext = createContext();

let globalSound = null;
let wasPlayingBeforePause = false;

export const SoundProvider = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!globalSound) {
      globalSound = new Howl({
        src: ['/ambient.mp3'],
        loop: true,
        volume: 0.5,
        html5: true,
        onloaderror: (id, err) => console.error('Sound load error:', err),
        onplayerror: (id, err) => {
          console.error('Sound play error:', err);
        }
      });
    }

    // Pause son quand l'utilisateur quitte la fenêtre
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // L'utilisateur a quitté l'onglet/fenêtre
        if (globalSound && globalSound.playing()) {
          globalSound.pause();
          wasPlayingBeforePause = true;
        }
      } else {
        // L'utilisateur revient sur l'onglet
        if (wasPlayingBeforePause && globalSound) {
          globalSound.play();
        }
      }
    };

    // Pause son quand la fenêtre perd le focus
    const handleWindowBlur = () => {
      if (globalSound && globalSound.playing()) {
        globalSound.pause();
        wasPlayingBeforePause = true;
      }
    };

    // Reprendre le son quand la fenêtre reprend le focus
    const handleWindowFocus = () => {
      if (wasPlayingBeforePause && globalSound) {
        globalSound.play();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const playSound = () => {
    if (globalSound && !globalSound.playing()) {
      globalSound.play();
      setIsPlaying(true);
      wasPlayingBeforePause = true;
    }
  };

  const stopSound = () => {
    if (globalSound) {
      globalSound.pause();
      setIsPlaying(false);
      wasPlayingBeforePause = false;
    }
  };

  const toggleSound = () => {
    if (isPlaying) {
      stopSound();
    } else {
      playSound();
    }
  };

  return (
    <SoundContext.Provider value={{ isPlaying, playSound, stopSound, toggleSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
