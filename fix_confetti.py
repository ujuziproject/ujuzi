import re

with open('src/components/Step6Review.tsx', 'r') as f:
    content = f.read()

target = """export function Step6Review({ userId, onNext }: Step6Props) {"""

replacement = """const Confetti = () => {
  const [pieces, setPieces] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#5b4fe8'];
    const newPieces = Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDuration: `${Math.random() * 3 + 2.5}s`,
      animationDelay: `${Math.random() * 0.5}s`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      isCircle: Math.random() > 0.5
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <style>
        {`
          @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg) scale(1); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg) scale(0.5); opacity: 1; }
          }
        `}
      </style>
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute -top-10 opacity-0"
          style={{
            left: p.left,
            width: p.isCircle ? '8px' : '10px',
            height: p.isCircle ? '8px' : '20px',
            borderRadius: p.isCircle ? '50%' : '2px',
            backgroundColor: p.backgroundColor,
            animation: `confetti-fall ${p.animationDuration} ease-in ${p.animationDelay} forwards`,
          }}
        />
      ))}
    </div>
  );
};

export function Step6Review({ userId, onNext }: Step6Props) {"""

content = content.replace(target, replacement)

target_return = """  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">"""

replacement_return = """  return (
    <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Confetti />"""

content = content.replace(target_return, replacement_return)

with open('src/components/Step6Review.tsx', 'w') as f:
    f.write(content)
