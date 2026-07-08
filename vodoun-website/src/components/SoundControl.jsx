import { useSound } from '../context/SoundContext';

export default function SoundControl() {
  const { isPlaying, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-8 left-8 z-[100] w-14 h-14 rounded-full bg-noir border-2 border-or flex items-center justify-center text-ivoire hover:bg-or hover:text-noir transition-all duration-500 group"
      aria-label={isPlaying ? "Désactiver le son" : "Activer le son"}
    >
      {isPlaying ? (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.707.707V17a1 1 0 01-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.707.707V17a1 1 0 01-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M14.121 9.879a5 5 0 010 4.242" />
        </svg>
      )}
    </button>
  );
}