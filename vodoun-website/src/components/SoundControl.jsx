import { useSound } from '../context/SoundContext';

export default function SoundControl() {
  const { isPlaying, toggleSound } = useSound();

  return (
    <button
      onClick={toggleSound}
      className="fixed bottom-8 left-8 z-[100] flex items-center gap-2 px-4 py-3 rounded-full bg-noir border border-or/40 text-ivoire hover:bg-or hover:text-noir hover:border-or transition-all duration-500 group shadow-[0_4px_20px_rgba(0,0,0,0.4)]"
      aria-label={isPlaying ? "Désactiver le son" : "Activer le son"}
    >
      {isPlaying ? (
        <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.707.707V17a1 1 0 01-1.707.707L5.586 15z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l3.707-3.707a1 1 0 011.707.707V17a1 1 0 01-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728M14.121 9.879a5 5 0 010 4.242" />
        </svg>
      )}
      <span className="text-[9px] uppercase tracking-[0.3em] font-bold hidden sm:block">
        {isPlaying ? 'Son On' : 'Son Off'}
      </span>
    </button>
  );
}