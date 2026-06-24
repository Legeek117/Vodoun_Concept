import { createContext, useContext, useEffect, useState } from 'react';
import { Howl } from 'howler';

const SoundContext = createContext();

let globalSound = null;

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
          globalSound.once('unlock', () => globalSound.play());
        }
      });
    }

    const handleFirstInteraction = () => {
      if (globalSound && !globalSound.playing()) {
        globalSound.play();
        setIsPlaying(true);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('scroll', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('scroll', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const playSound = () => {
    if (globalSound && !globalSound.playing()) {
      globalSound.play();
      setIsPlaying(true);
    }
  };

  const stopSound = () => {
    if (globalSound) {
      globalSound.stop();
      setIsPlaying(false);
    }
  };

  return (
    <SoundContext.Provider value={{ isPlaying, playSound, stopSound }}>
      {children}
    </SoundContext.Provider>
  );
};

export const useSound = () => useContext(SoundContext);
