import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../types';

export function BadgeToast() {
  const [queue, setQueue] = useState<Badge[]>([]);

  useEffect(() => {
    const handleBadgesAwarded = (e: any) => {
       const newBadges = e.detail;
       if (Array.isArray(newBadges) && newBadges.length > 0) {
          setQueue(prev => [...prev, ...newBadges]);
       }
    };
    window.addEventListener('badgesAwarded', handleBadgesAwarded);
    return () => window.removeEventListener('badgesAwarded', handleBadgesAwarded);
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
       const timer = setTimeout(() => {
          setQueue(prev => prev.slice(1));
       }, 5000);
       return () => clearTimeout(timer);
    }
  }, [queue]);

  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
         {queue.length > 0 && (
            <motion.div
              key={queue[0].id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
              className="bg-ink text-surface px-6 py-4 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm border border-white/10"
            >
               <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center shrink-0 border border-accent/30 text-2xl">
                 {queue[0].icon_url || '🏆'}
               </div>
               <div>
                  <div className="text-[11px] font-bold uppercase tracking-widest text-accent mb-1">Badge Earned!</div>
                  <div className="font-bold text-white text-[15px] leading-tight mb-1">{queue[0].name}</div>
                  <div className="text-sm text-slate-400 leading-snug">{queue[0].description}</div>
               </div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  );
}
