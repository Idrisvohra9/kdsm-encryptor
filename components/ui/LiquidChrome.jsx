"use client";
import { useRef, useEffect, memo } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

export const LiquidChrome = memo(({
  baseColor = [0.1, 0.1, 0.1],
  speed = 0.2,
  amplitude = 0.5,
  frequencyX = 3,
  frequencyY = 2,
  ...props
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Enable built-in antialiasing.
    const renderer = new Renderer({ antialias: true });
    const gl = renderer.gl;
    gl.clearColor(1, 1, 1, 1);

    // Vertex shader: passes along position and uv.
    const vertexShader = `
      attribute vec2 position;
      attribute vec2 uv;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Fragment shader with the original vibrant color calculation.
    const fragmentShader = `
      precision highp float;
      uniform float uTime;
      uniform vec3 uResolution;
      uniform vec3 uBaseColor;
      uniform float uAmplitude;
      uniform float uFrequencyX;
      uniform float uFrequencyY;
      varying vec2 vUv;

      // Render function for a given uv coordinate.
      vec4 renderImage(vec2 uvCoord) {
          // Convert uvCoord (in [0,1]) to a fragment coordinate.
          vec2 fragCoord = uvCoord * uResolution.xy;
          // Map fragCoord to a normalized space.
          vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

          // Iterative cosine-based distortions.
          for (float i = 1.0; i < 10.0; i++){
              uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime);
              uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime);
          }

          // Original vibrant color computation.
          vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
          return vec4(color, 1.0);
      }

      void main() {
          // 3x3 supersampling for anti-aliasing.
          vec4 col = vec4(0.0);
          int samples = 0;
          for (int i = -1; i <= 1; i++){
              for (int j = -1; j <= 1; j++){
                  vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
                  col += renderImage(vUv + offset);
                  samples++;
              }
          }
          gl_FragColor = col / float(samples);
      }
    `;

    // Create geometry and program with uniforms.
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Float32Array([
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height,
          ]),
        },
        uBaseColor: { value: new Float32Array(baseColor) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    // Resize handler.
    function resize() {
      const scale = 1;
      renderer.setSize(
        container.offsetWidth * scale,
        container.offsetHeight * scale
      );
      const resUniform = program.uniforms.uResolution.value;
      resUniform[0] = gl.canvas.width;
      resUniform[1] = gl.canvas.height;
      resUniform[2] = gl.canvas.width / gl.canvas.height;
    }
    window.addEventListener("resize", resize);
    resize();

    // Animation loop.
    let animationId;
    function update(t) {
      animationId = requestAnimationFrame(update);
      // Multiply time by speed to adjust the animation rate.
      program.uniforms.uTime.value = t * 0.001 * speed;
      renderer.render({ scene: mesh });
    }
    animationId = requestAnimationFrame(update);

    container.appendChild(gl.canvas);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
      if (gl.canvas.parentElement) {
        gl.canvas.parentElement.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [baseColor, speed, amplitude, frequencyX, frequencyY]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full fixed inset-0"
      {...props}
    />
  );
});

LiquidChrome.displayName = 'LiquidChrome';

export default LiquidChrome;
