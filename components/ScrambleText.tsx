import React, { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

interface ScrambleTextProps {
  text: string;
  className?: string;
  trigger?: boolean;
}

const ScrambleText: React.FC<ScrambleTextProps> = ({ text, className, trigger }) => {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!trigger) {
        setDisplayText(text);
        return;
    }

    let iteration = 0;
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(prev => 
        text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }

      iteration += 1 / 3; 
    }, 30);

    return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [trigger, text]);
  
  return <span className={className}>{displayText}</span>;
};

export default ScrambleText;