"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type TimerProps = {
  seconds: number;
  isActive: boolean;
};

export default function Timer({ seconds, isActive }: TimerProps) {
  const [timeString, setTimeString] = useState<string>("00:00");
  const [progress, setProgress] = useState<number>(100);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  
  useEffect(() => {
      const format = (time: number): string => {
      const mins = Math.floor(time / 60);
      const secs = Math.floor(time % 60);
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    
    setTimeString(format(seconds));
    

    const maxTime = 60; // 60 seconds is the standard timer
    const currentProgress = Math.min(100, Math.max(0, (seconds / maxTime) * 100));
    setProgress(currentProgress);
    
   
    setIsWarning(seconds <= 10 && isActive);
  }, [seconds, isActive]);

  return (
    <div className="inline-flex items-center">
      <motion.span
        className={`font-mono ${isWarning ? "font-bold text-destructive" : ""}`}
        animate={{ scale: isWarning && seconds > 0 ? [1, 1.1, 1] : 1 }}
        transition={{ repeat: isWarning ? Infinity : 0, duration: 1 }}
      >
        {timeString}
      </motion.span>
    </div>
  );
}