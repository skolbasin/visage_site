import { Star, Sparkles } from 'lucide-react';

export default function AnimatedStars() {
  const stars = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 2 + Math.random() * 4,
    size: 1.5 + Math.random() * 4,
    opacity: 0.1 + Math.random() * 0.3,
  }));

  const floatingStars = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 4 + Math.random() * 4,
    size: 16 + Math.random() * 20,
    type: i % 2 === 0 ? 'star' : 'sparkle',
    speed: i % 3 === 0 ? 'slow' : i % 3 === 1 ? 'medium' : 'fast',
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute animate-twinkle"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        >
          <Star
            size={star.size}
            className="text-[#4a7c59]"
            style={{ opacity: star.opacity, fill: `rgba(74, 124, 89, ${star.opacity * 0.5})` }}
          />
        </div>
      ))}

      {floatingStars.map((item) => {
        const speedClass =
          item.speed === 'slow' ? 'animate-float-slow' :
          item.speed === 'medium' ? 'animate-float-medium' : 'animate-float-fast';

        return (
          <div
            key={item.id}
            className={`absolute ${speedClass}`}
            style={{
              left: `${item.left}%`,
              top: `${item.top}%`,
              animationDelay: `${item.delay}s`,
              animationDuration: `${item.duration}s`,
            }}
          >
            {item.type === 'star' ? (
              <Star
                size={item.size}
                className="text-[#4a7c59]/15 fill-[#4a7c59]/5"
              />
            ) : (
              <Sparkles
                size={item.size}
                className="text-[#4a7c59]/20"
              />
            )}
          </div>
        );
      })}

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(-30px) translateX(15px) rotate(10deg); }
          50% { transform: translateY(-15px) translateX(-10px) rotate(-5deg); }
          75% { transform: translateY(-25px) translateX(20px) rotate(15deg); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          33% { transform: translateY(-20px) translateX(-15px) rotate(-8deg); }
          66% { transform: translateY(-10px) translateX(10px) rotate(5deg); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg); }
          25% { transform: translateY(-15px) translateX(8px) rotate(8deg); }
          50% { transform: translateY(-8px) translateX(-12px) rotate(-6deg); }
          75% { transform: translateY(-12px) translateX(6px) rotate(4deg); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: floatSlow 12s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: floatMedium 8s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: floatFast 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}