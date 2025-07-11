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
    fromFontVariationSettings = "'wght' 400", // Default weight for Tomorrow font
    toFontVariationSettings = "'wght' 800",   // Hover weight for Tomorrow font
    containerRef,
    radius = 50,
    falloff = "linear",
    className = "",
    onClick,
    style,
    ...restProps
  } = props;

  const letterRefs = useRef([]);
  const interpolatedSettingsRef = useRef([]);
  const mousePositionRef = useMousePositionRef(containerRef);
  const lastPositionRef = useRef({ x: null, y: null });

  // Memoized font variation settings parser
  const parsedSettings = useMemo(() => {
    const parseSettings = (settingsStr) => {
      const settings = new Map();
      const pairs = settingsStr.split(",");
      
      pairs.forEach(pair => {
        const trimmed = pair.trim();
        const match = trimmed.match(/['"]?(\w+)['"]?\s+(\d+(?:\.\d+)?)/);
        if (match) {
          settings.set(match[1], parseFloat(match[2]));
        }
      });
      
      return settings;
    };

    const fromSettings = parseSettings(fromFontVariationSettings);
    const toSettings = parseSettings(toFontVariationSettings);

    return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
      axis,
      fromValue,
      toValue: toSettings.get(axis) ?? fromValue,
    }));
  }, [fromFontVariationSettings, toFontVariationSettings]);

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

  // Animation frame callback for smooth font variation updates
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
        letterRef.style.fontVariationSettings = fromFontVariationSettings;
        return;
      }

      const falloffValue = calculateFalloff(distance);
      const newSettings = parsedSettings
        .map(({ axis, fromValue, toValue }) => {
          const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
          return `'${axis}' ${interpolatedValue}`;
        })
        .join(", ");

      interpolatedSettingsRef.current[index] = newSettings;
      letterRef.style.fontVariationSettings = newSettings;
    });
  }, [containerRef, calculateDistance, calculateFalloff, fromFontVariationSettings, parsedSettings, radius]);

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
        fontVariationSettings: fromFontVariationSettings,
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
                  fontVariationSettings:
                    interpolatedSettingsRef.current[currentLetterIndex] || fromFontVariationSettings,
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
