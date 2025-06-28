interface AnimatedBackgroundProps {
  darkMode: boolean;
  scrollY?: number;
  isRoom?: boolean;
}

function AnimatedBackground({ darkMode, scrollY = 0, isRoom = false }: AnimatedBackgroundProps) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className={`absolute -top-40 -right-40 w-80 h-80 rounded-full ${
          isRoom ? 'opacity-10' : 'opacity-20'
        } blur-3xl transition-all duration-1000 ${darkMode ? 'bg-triagen-secondary-green' : 'bg-triagen-secondary-green/60'}`}
        style={!isRoom ? { transform: `translateY(${scrollY * 0.1}px)` } : undefined}
      ></div>
      <div
        className={`absolute top-1/2 -left-40 w-96 h-96 rounded-full ${
          isRoom ? 'opacity-5' : 'opacity-15'
        } blur-3xl transition-all duration-1000 ${darkMode ? 'bg-triagen-highlight-purple' : 'bg-triagen-highlight-purple/60'}`}
        style={!isRoom ? { transform: `translateY(${scrollY * -0.05}px)` } : undefined}
      ></div>
      {!isRoom && (
        <div
          className={`absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl transition-all duration-1000 ${darkMode ? 'bg-triagen-dark-bg' : 'bg-triagen-dark-bg/60'}`}
          style={{ transform: `translateY(${scrollY * 0.08}px)` }}
        ></div>
      )}
    </div>
  );
}

export default AnimatedBackground;