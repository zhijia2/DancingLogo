/**
 * @file A simple WebGL example drawing a triangle with colors
 * @author Eric Shaffer <shaffer1@eillinois.edu>
 *
 * Updated Spring 2021 to use WebGL 2.0 and GLSL 3.00
 */

/** @global The WebGL context */
var gl;

/** @global The HTML5 canvas we draw on */
var canvas;

/** @global A simple GLSL shader program */
var shaderProgram;

/** @global The WebGL buffer holding the triangle */
var vertexPositionBuffer;

/** @global The WebGL buffer holding the vertex colors */
var vertexColorBuffer;

/** @global The vertex array object for the triangle */
var vertexArrayObject;

/** @global The rotation angle of our triangle */
var rotAngle = 0;

/** @global The ModelView matrix contains any modeling and viewing transformations */
var modelViewMatrix = glMatrix.mat4.create();

/** @global Records time last frame was rendered */
var previousTime = 0;
var scale;

var logo = true;
var change = true;

/**
 * Translates degrees to radians
 * @param {Number} degrees Degree input to function
 * @return {Number} The radians that correspond to the degree input
 */
function degToRad(degrees) {
        return degrees * Math.PI / 180;
}

function modify(point){
  return Math.cos(point);
}


/**
 * Creates a context for WebGL
 * @param {element} canvas WebGL canvas
 * @return {Object} WebGL context
 */
function createGLContext(canvas) {
  var context = null;
  context = canvas.getContext("webgl2");
  if (context) {
    context.viewportWidth = canvas.width;
    context.viewportHeight = canvas.height;
  } else {
    alert("Failed to create WebGL context!");
  }
  return context;
}


/**
 * Loads a shader.
 * Retrieves the source code from the HTML document and compiles it.
 * @param {string} id ID string for shader to load. Either vertex shader/fragment shader
 */
function loadShaderFromDOM(id) {
  var shaderScript = document.getElementById(id);

  // If we don't find an element with the specified id
  // we do an early exit
  if (!shaderScript) {
    return null;
  }

  var shaderSource = shaderScript.text;

  var shader;
  if (shaderScript.type == "x-shader/x-fragment") {
    shader = gl.createShader(gl.FRAGMENT_SHADER);
  } else if (shaderScript.type == "x-shader/x-vertex") {
    shader = gl.createShader(gl.VERTEX_SHADER);
  } else {
    return null;
  }

  gl.shaderSource(shader, shaderSource);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}


/**
 * Set up the fragment and vertex shaders.
 */
function setupShaders() {
  // Compile the shaders' source code.
  vertexShader = loadShaderFromDOM("shader-vs");
  fragmentShader = loadShaderFromDOM("shader-fs");

  // Link the shaders together into a program.
  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert("Failed to setup shaders");
  }

  // We only use one shader program for this example, so we can just bind
  // it as the current program here.
  gl.useProgram(shaderProgram);

  // Query the index of each attribute in the list of attributes maintained
  // by the GPU.
  shaderProgram.vertexPositionAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexPosition");
  shaderProgram.vertexColorAttribute =
    gl.getAttribLocation(shaderProgram, "aVertexColor");

  //Get the index of the Uniform variable as well
  shaderProgram.modelViewMatrixUniform =
    gl.getUniformLocation(shaderProgram, "uModelViewMatrix");
}


/**
 * Set up the buffers to hold the triangle's vertex positions and colors.
 */
 var scalar = 0;
function setupBuffers() {

  scalar += 2;

  var vertices = [
    -0.6+0.1*Math.cos(scalar), 1.0, 0.0,
    -0.6+0.1*Math.cos(scalar), 0.6, 0.0,
    -0.2+0.1*Math.cos(scalar), 0.6, 0.0,

    -0.2+0.1*Math.cos(scalar), -0.6, 0.0,
    -0.6+0.1*Math.cos(scalar), -0.6, 0.0,
    -0.6+0.1*Math.cos(scalar), -1.0, 0.0,

    0.6+0.1*Math.cos(scalar), -1.0, 0.0,
    0.6+0.1*Math.cos(scalar), -0.6, 0.0,
    0.2+0.1*Math.cos(scalar), -0.6, 0.0,

    0.2+0.1*Math.cos(scalar), 0.6, 0.0,
    0.6+0.1*Math.cos(scalar), 0.6, 0.0,
    0.6+0.1*Math.cos(scalar), 1.0, 0.0,

    -0.6+0.1*Math.cos(scalar), 1.0, 0.0,
    -0.2+0.1*Math.cos(scalar), 0.6, 0.0,
    0.6+0.1*Math.cos(scalar), 1.0, 0.0,

    -0.2+0.1*Math.cos(scalar), 0.6, 0.0,
    0.2+0.1*Math.cos(scalar), 0.6, 0.0,
    0.6+0.1*Math.cos(scalar), 1.0, 0.0,

    -0.2, -0.6, 0.0,
    0.2, -0.6, 0.0,
    -0.2, 0.6, 0.0,

    0.6+0.1*Math.cos(scalar), -1.0, 0.0,
    -0.2+0.1*Math.cos(scalar), -0.6, 0.0,
    0.2+0.1*Math.cos(scalar), -0.6, 0.0,

    -0.2, 0.6, 0.0,
    0.2, 0.6, 0.0,
    0.2, -0.6, 0.0,

    -0.6+0.1*Math.cos(scalar), -1.0, 0.0,
    0.6+0.1*Math.cos(scalar), -1.0, 0.0,
    -0.2+0.1*Math.cos(scalar), -0.6, 0.0
  ];

  var colors = [
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0,
        1.0, 0.3, 0.0, 1.0
    ];




  vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject);

  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  var numOfVertices = vertices.length/3

  vertexPositionBuffer.numberOfItems = numOfVertices;
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Do the same steps for the color buffer.
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = vertices.length/3;
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                         vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

   // Enable each attribute we are using in the VAO.
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  gl.bindVertexArray(null);
}


/**
 * Draws a frame to the screen.
 */
function draw() {
  // Transform the clip coordinates so the render fills the canvas dimensions.
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

  // Clear the screen.
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Use the vertex array object that we set up.
  gl.bindVertexArray(vertexArrayObject);

  // Send the ModelView matrix with our transformations to the vertex shader.
  gl.uniformMatrix4fv(shaderProgram.modelViewMatrixUniform,
                      false, modelViewMatrix);

  // Render the triangle.
  gl.drawArrays(gl.TRIANGLES, 0, vertexPositionBuffer.numberOfItems);

  // Unbind the vertex array object to be safe.
  gl.bindVertexArray(null);
}


/**
 * Set up the tree shape buffers to hold the triangle's vertex positions and colors.
 */
 var changer = 0;
function setupBuffersMy(){
  changer += 1;
var maso = [
  //tree
  0.5, 0.0, 0.0,
  -0.5, 0.0, 0.0,
  0.0, 0.5, 0.0,

  0.25, 0.5, 0.0,
  -0.25, 0.5, 0.0,
  0.0, 0.75, 0.0,

  0.0, 0.0, 0.0,
  0.75, -0.75, 0.0,
  -0.75, -0.75, 0.0,

//trunk
  -0.1, -0.75, 0.0,
  -0.1, -1.0, 0.0,
  0.1, -1.0, 0.0,

  -0.1, -0.75, 0.0,
  0.1, -1.0, 0.0,
  0.1, -0.75, 0.0,

//light
0.0, 0.75, 0.0,
0.0, 0.8, 0.0,
0.05, 0.775, 0.0,

0.0, 0.75, 0.0,
0.0, 0.8, 0.0,
-0.05, 0.775, 0.0

];

var col = [
  //tree
  0.2, 1.0, 0.2, 1.0,
  0.2, 1.0, 0.2, 1.0,
  0.2, 1.0, 0.2, 1.0,

  0.2, 1.0, 0.2, 1.0,
  0.2, 1.0, 0.2, 1.0,
  0.2, 1.0, 0.2, 1.0,

  0.2, 1.0, 0.2, 1.0,
  0.2, 1.0, 0.2, 1.0,
  0.2, 1.0, 0.2, 1.0,
  //trunk

  0.5, 0.5, 0.5, 1.0,
  0.5, 0.5, 0.5, 1.0,
  0.5, 0.5, 0.5, 1.0,

  0.5, 0.5, 0.5, 1.0,
  0.5, 0.5, 0.5, 1.0,
  0.5, 0.5, 0.5, 1.0,

  //light

  Math.cos(changer), 0.0, 0.0, 1.0,
  Math.cos(changer), 0.0, 0.0, 1.0,
  Math.cos(changer), 0.0, 0.0, 1.0,

  Math.cos(changer), 0.0, 0.0, 1.0,
  Math.cos(changer), 0.0, 0.0, 1.0,
  Math.cos(changer), 0.0, 0.0, 1.0

];



  vertexArrayObject = gl.createVertexArray();
  gl.bindVertexArray(vertexArrayObject);

  vertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(maso), gl.DYNAMIC_DRAW);
  vertexPositionBuffer.itemSize = 3;
  var numOfVertices = maso.length/3

  vertexPositionBuffer.numberOfItems = numOfVertices;
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
                         vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

  // Do the same steps for the color buffer.
  vertexColorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW);
  vertexColorBuffer.itemSize = 4;
  vertexColorBuffer.numItems = maso.length/3;
  gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
                         vertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

   // Enable each attribute we are using in the VAO.
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
  gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

  gl.bindVertexArray(null);
}


/**
 * Animates the triangle
 */
 function animate(currentTime) {

  var speed = document.getElementById("speed").value;
  currentTime *= 0.001;
  var deltaTime = currentTime - previousTime;
  previousTime = currentTime;
  rotAngle += speed * deltaTime;
  if (rotAngle > 360.0)
      rotAngle = 0.0;
  var vect = glMatrix.vec3.fromValues(rotAngle/360, rotAngle/360, rotAngle/360);
  //the stop of value

  var type = document.getElementsByName("type");

  if (type[0].checked) {
    //if (logo != true) change = true;
    logo = true;
  } else if (type[1].checked) {
    //if (logo != false)
    //change = true;
    logo = false;
  }

  //if (change) {
    if (logo) {
      glMatrix.mat4.fromZRotation(modelViewMatrix, degToRad(rotAngle));
      glMatrix.mat4.scale(modelViewMatrix, modelViewMatrix, vect);
      setupBuffers();
    } else {
      setupBuffersMy();
    }
  //}

  draw();
  requestAnimationFrame(animate);
}

/**
 * Startup function called from html code to start the program.
 */
 function startup() {
  console.log("Starting animation...");
  canvas = document.getElementById("myGLCanvas");
  gl = createGLContext(canvas);

  setupShaders();

  setupBuffers();
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  requestAnimationFrame(animate);

}
