import { useEffect, useState } from 'react';
export type Coord = {
  x: number;
  y: number;
};
export const useMousePosition = (element: string | null) => {
  const [position, setPosition] = useState<Coord>({ x: 0, y: 0 });

  useEffect(() => {
    const setFromEvent = (e: any) =>
      setPosition({ x: e.clientX, y: e.clientY });
    const el = window.document.querySelector(element || '');
    if (!element) {
      window.addEventListener('mousemove', setFromEvent);
    } else {
      if (el) {
        el.addEventListener('mousemove', setFromEvent);
      }
    }

    return () => {
      if (!element) {
        window.removeEventListener('mousemove', setFromEvent);
      } else {
        if (el) {
          el.removeEventListener('mousemove', setFromEvent);
        }
      }
    };
  }, []);

  return position;
};
