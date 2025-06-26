/**
 * WebGL vertex shader where position of the vertexes is set directly.
 */
var vertexShaderSource = "\nattribute vec4 a_position;\n\nvoid main() {\n    gl_Position = a_position;\n}\n";
/**
 * WebGL fragment shader from:
 * https://www.youtube.com/watch?v=f4s1h2YETNY
 */
var fragmentShaderSource = "\nprecision mediump float;\n\nuniform vec2 u_resolution;\nuniform float u_time;\n\nvec3 palette( float t ) {\n    vec3 a = vec3(0.5,   0.5,   0.5);\n    vec3 b = vec3(0.5,   0.5,   0.5);\n    vec3 c = vec3(1.0,   1.0,   1.0);\n    vec3 d = vec3(0.263, 0.416, 0.557);\n\n    return a + b * cos(6.28318 * (c * t + d));\n}\n\nvoid main() {\n    vec2 fragCoord = gl_FragCoord.xy;\n\n    vec2 uv = (fragCoord * 2.0 - u_resolution.xy) / u_resolution.y;\n    vec2 uv0 = uv;\n    vec3 finalColor = vec3(0.0);\n    \n    for (float i = 0.0; i < 4.0; i++) {\n        uv = fract(uv * 1.5) - 0.5;\n\n        float d = length(uv) * exp(-length(uv0));\n\n        vec3 col = palette(length(uv0) + i * .4 + u_time * .4);\n\n        d = sin(d * 8. + u_time) / 8.;\n        d = abs(d);\n\n        d = pow(0.01 / d, 1.2);\n\n        finalColor += col * d;\n    }\n        \n    gl_FragColor = vec4(finalColor, 1.0);\n}\n";
main();
function main() {
    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('webgl');
    if (!gl) {
        throw new Error('WebGL not supported. Please use a browser that supports WebGL.');
    }
    // Create WebGL program with vertex and fragment shaders
    var vertexShader = createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    var fragmentShader = createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
    var program = createProgram(gl, vertexShader, fragmentShader);
    setupVertexShaderData(gl, program);
    updateCanvasSize(gl, program, canvas);
    window.addEventListener('resize', function () {
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
function createShader(gl, sourceCode, type) {
    var shader = gl.createShader(type);
    if (!shader) {
        throw new Error('Could not create shader.');
    }
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var info = gl.getShaderInfoLog(shader);
        throw new Error("Could not compile WebGL program. \n\n".concat(info));
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
function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var info = gl.getProgramInfoLog(program);
        throw new Error("Could not compile WebGL program. \n\n".concat(info));
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
function setupVertexShaderData(gl, program) {
    // Create a buffer with the positions of the vertices of the triangles
    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    var positions = new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    // Bind the position buffer to the shader's attribute
    var positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
}
/**
 * Updates the canvas size and sets the viewport and resolution uniform variable.
 * @param gl The WebGL rendering context.
 * @param program The WebGL program.
 * @param canvas The HTML canvas element.
 */
function updateCanvasSize(gl, program, canvas) {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // Set the viewport to match the canvas size
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Set the resolution uniform variable
    var resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
}
/**
 * Starts the animation loop, updating the time uniform variable and drawing triangles.
 * @param gl The WebGL rendering context.
 * @param program The WebGL program.
 */
function startAnimation(gl, program) {
    // Get the time uniform location
    var timeLocation = gl.getUniformLocation(program, 'u_time');
    // Start the animation loop
    var startTime = performance.now();
    var render = function (currentTime) {
        // Set the time uniform variable
        gl.uniform1f(timeLocation, (currentTime - startTime) / 1000.0);
        // Draw triangles
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}
