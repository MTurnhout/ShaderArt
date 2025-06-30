/**
 * WebGL vertex shader where position of the vertexes is set directly.
 */
const vertexShaderSource = `
attribute vec4 a_position;

void main() {
    gl_Position = a_position;
}
`;

/**
 * WebGL fragment shader from:
 * https://www.youtube.com/watch?v=f4s1h2YETNY
 */
const fragmentShaderSource = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;

vec3 palette( float t ) {
    vec3 a = vec3(0.5,   0.5,   0.5);
    vec3 b = vec3(0.5,   0.5,   0.5);
    vec3 c = vec3(1.0,   1.0,   1.0);
    vec3 d = vec3(0.263, 0.416, 0.557);

    return a + b * cos(6.28318 * (c * t + d));
}

void main() {
    vec2 fragCoord = gl_FragCoord.xy;

    vec2 uv = (fragCoord * 2.0 - u_resolution.xy) / u_resolution.y;
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i * 0.4 + u_time * 0.4);

        d = sin(d * 8.0 + u_time) / 8.0;
        d = abs(d);

        d = pow(0.01 / d, 1.2);

        finalColor += col * d;
    }
        
    gl_FragColor = vec4(finalColor, 1.0);
}
`;

main();

function main(): void {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error(
      "Canvas element not found. Please ensure there is a <canvas> element in the HTML."
    );
  }

  const gl = canvas.getContext("webgl");
  if (!gl) {
    throw new Error(
      "WebGL not supported. Please use a browser that supports WebGL."
    );
  }

  // Create WebGL program with vertex and fragment shaders
  const vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = createShader(
    gl,
    fragmentShaderSource,
    gl.FRAGMENT_SHADER
  );
  const program = createProgram(gl, vertexShader, fragmentShader);

  setupVertexShaderData(gl, program);

  updateCanvasSize(gl, program, canvas);
  window.addEventListener("resize", () => {
    updateCanvasSize(gl, program, canvas);
  });

  startAnimation(gl, program);
}

/**
 * Creates a WebGL shader from the provided source code and type.
 * Copied from: https://developer.mozilla.org/en-US/docs/Web/API/WebGLShader
 * @param gl The WebGL rendering context.
 * @param sourceCode The GLSL source code for the shader.
 * @param type The type of shader (VERTEX_SHADER or FRAGMENT_SHADER).
 * @returns The created WebGLShader.
 */
function createShader(
  gl: WebGLRenderingContext,
  sourceCode: string,
  type: GLenum
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Could not create shader.");
  }

  gl.shaderSource(shader, sourceCode);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    throw new Error(`Could not compile WebGL program. \n\n${info}`);
  }

  return shader;
}

/**
 * Creates a WebGL program by attaching the provided vertex and fragment shaders.
 * @param gl The WebGL rendering context.
 * @param vertexShader The compiled vertex shader.
 * @param fragmentShader The compiled fragment shader.
 * @returns The created WebGLProgram.
 */
function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    throw new Error(`Could not compile WebGL program. \n\n${info}`);
  }

  gl.useProgram(program);

  return program;
}

/**
 * Sets up the vertex shader data by creating a buffer for the vertex positions
 * and binding it to the shader's attribute.
 * @param gl The WebGL rendering context.
 * @param program The WebGL program.
 */
function setupVertexShaderData(
  gl: WebGLRenderingContext,
  program: WebGLProgram
): void {
  // Create a buffer with the positions of the vertices of the triangles
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  const positions = new Float32Array([
    -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
  ]);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  // Bind the position buffer to the shader's attribute
  const positionLocation = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}

/**
 * Updates the canvas size/resolution, viewport and resolution uniform variable.
 * @param gl The WebGL rendering context.
 * @param program The WebGL program.
 * @param canvas The HTML canvas element.
 */
function updateCanvasSize(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  canvas: HTMLCanvasElement
): void {
  // Set the canvas size/resolution
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  // Set the viewport to match the canvas size
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Set the resolution uniform variable
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
}

/**
 * Starts the animation loop, updating the time uniform variable and drawing triangles.
 * @param gl The WebGL rendering context.
 * @param program The WebGL program.
 */
function startAnimation(
  gl: WebGLRenderingContext,
  program: WebGLProgram
): void {
  // Get the time uniform location
  const timeLocation = gl.getUniformLocation(program, "u_time");

  // Start the animation loop
  const startTime = performance.now();
  const render = (currentTime: DOMHighResTimeStamp) => {
    // Set the time uniform variable
    gl.uniform1f(timeLocation, (currentTime - startTime) / 1000.0);

    // Draw triangles
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  };

  requestAnimationFrame(render);
}
