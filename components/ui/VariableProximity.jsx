import { forwardRef, useMemo, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

// Custom hook for animation frame with memoized callback
function useAnimationFrame(callback) {
  const memoizedCallback = useCallback(callback, [callback]);
  
  useEffect(() => {
    let frameId;
    const loop = () => {
      memoizedCallback();
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [memoizedCallback]);
}

// Hook to track mouse position relative to container
function useMousePositionRef(containerRef) {
  const positionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Update mouse position relative to container or window
    const updatePosition = (x, y) => {
      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev) => updatePosition(ev.clientX, ev.clientY);
    const handleTouchMove = (ev) => {
      const touch = ev.touches[0];
      updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [containerRef]);

  return positionRef;
}

const VariableProximity = forwardRef((props, ref) => {
  const {
    label,
    fromFontWeight = 400, // Use regular font weight instead of font variation settings
    toFontWeight = 800,   // Target font weight for proximity effect
    containerRef,
    radius = 50,
    falloff = "linear",
    className = "",
    onClick,
    style,
    ...restProps
  } = props;

  const letterRefs = useRef([]);
  const interpolatedWeightsRef = useRef([]);
  const mousePositionRef = useMousePositionRef(containerRef);
  const lastPositionRef = useRef({ x: null, y: null });

  // Calculate distance between two points
  const calculateDistance = useCallback((x1, y1, x2, y2) =>
    Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2), []);

  // Calculate falloff value based on distance and falloff type
  const calculateFalloff = useCallback((distance) => {
    const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
    switch (falloff) {
      case "exponential": return norm ** 2;
      case "gaussian": return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
      case "linear":
      default: return norm;
    }
  }, [radius, falloff]);

  // Animation frame callback for smooth font weight updates
  const animationCallback = useCallback(() => {
    if (!containerRef?.current) return;
    const { x, y } = mousePositionRef.current;
    if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
      return;
    }
    lastPositionRef.current = { x, y };

    const containerRect = containerRef.current.getBoundingClientRect();

    letterRefs.current.forEach((letterRef, index) => {
      if (!letterRef) return;

      const rect = letterRef.getBoundingClientRect();
      const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
      const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

      const distance = calculateDistance(
        mousePositionRef.current.x,
        mousePositionRef.current.y,
        letterCenterX,
        letterCenterY
      );

      if (distance >= radius) {
        letterRef.style.fontWeight = fromFontWeight.toString();
        letterRef.style.transform = 'scale(1)';
        return;
      }

      const falloffValue = calculateFalloff(distance);
      const interpolatedWeight = fromFontWeight + (toFontWeight - fromFontWeight) * falloffValue;
      const scale = 1 + (falloffValue * 0.1); // Add subtle scale effect
      
      interpolatedWeightsRef.current[index] = interpolatedWeight;
      letterRef.style.fontWeight = Math.round(interpolatedWeight).toString();
      letterRef.style.transform = `scale(${scale})`;
      letterRef.style.transition = 'transform 0.1s ease-out';
    });
  }, [containerRef, calculateDistance, calculateFalloff, fromFontWeight, toFontWeight, radius]);

  useAnimationFrame(animationCallback);

  // Memoized words array to prevent unnecessary re-renders
  const words = useMemo(() => label.split(" "), [label]);
  let letterIndex = 0;

  return (
    <span
      ref={ref}
      onClick={onClick}
      style={{
        display: "inline",
        fontFamily: "var(--font-tomorrow), sans-serif",
        fontWeight: fromFontWeight,
        ...style,
      }}
      className={className}
      {...restProps}
    >
      {words.map((word, wordIndex) => (
        <span
          key={wordIndex}
          className="inline-block whitespace-nowrap"
        >
          {word.split("").map((letter) => {
            const currentLetterIndex = letterIndex++;
            return (
              <motion.span
                key={currentLetterIndex}
                ref={(el) => { letterRefs.current[currentLetterIndex] = el; }}
                style={{
                  display: "inline-block",
                  fontWeight: interpolatedWeightsRef.current[currentLetterIndex] || fromFontWeight,
                  transformOrigin: 'center',
                }}
                aria-hidden="true"
              >
                {letter}
              </motion.span>
            );
          })}
          {wordIndex < words.length - 1 && (
            <span className="inline-block">&nbsp;</span>
          )}
        </span>
      ))}
      <span className="sr-only">{label}</span>
    </span>
  );
});

VariableProximity.displayName = "VariableProximity";
export default VariableProximity;
