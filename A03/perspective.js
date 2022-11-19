"use strict";
// First of all, we need to define variables needed for this implementation

let perspectiveExample = function(){
let canvas;
let gl;

let numPositions  = 36;
let numVertices = 8
//two lists are created to define position and color of arrays
let positionsArray = [];
let colorsArray = [];
// vertecies are defined as below:
let vertices = [
    vec4(-0.5, -0.5,  1.5, 1.0),
    vec4(-0.5,  0.5,  1.5, 1.0),
    vec4(0.5,  0.5,  1.5, 1.0),
    vec4(0.5, -0.5,  1.5, 1.0),
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5,  0.5, 0.5, 1.0),
    vec4(0.5,  0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0)
];
// colors are defined as follows:
let vertexColors = [
    vec4(0.4, 0.4, 0.4, 1.0),  // black
    vec4(1.0, 0.5, 0.0, 1.0),  // orange
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0),  // cyan
    vec4(1.0, 1.0, 1.0, 1.0),  // white
];
/* To define view types, we need some more variables.
These variable are defined below */
let left = -1, right = 1, bottom = 1, top = -1; 
let near = -3;
let far = 3;
let radius = 4.0;
let theta = 0.0;
let phi = 0.0;
let dr = 5.0 * Math.PI/180.0;
let Perspective = 0

let  fovy = 45.0;  // this variable is Field-of-view in Y direction angle (in degrees)
let  aspect;       // this variable is Viewport aspect ratio
// Likewise, the below variables are required for our model:
let modelViewMatrixLoc, projectionMatrixLoc;
let modelViewMatrix, projectionMatrix;
let eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
// To create our view a function is defined to create the our model
function quad(a, b, c, d) {
     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[b]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[a]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[c]);
     colorsArray.push(vertexColors[a]);
     positionsArray.push(vertices[d]);
     colorsArray.push(vertexColors[a]);
}

// The cube is defined through the below function:
function colorCube()
{
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
}

// Unload method is used to load the model
window.onload = function init() {

    canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //  shaders and initialize attribute buffers are loaded through the following codes:
    let program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    colorCube();

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    let colorLoc = gl.getAttribLocation(program, "aColor");
    gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorLoc);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    let positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);

    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

/* buttons for viewing parameters are defined as belows.
    9 buttons are created for this assignment plus a reset button*/

    document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
    document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
    document.getElementById("Button3").onclick = function(){radius *= 2.0;};
    document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){theta += dr;};
    document.getElementById("Button6").onclick = function(){theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    document.getElementById("Button9").onclick = function(){ Perspective +=1; console.log(Perspective%2)};
    render();
}
/* A render function is defined to create the final model.
The variables defined earlier are used in this function. */
let render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    eye = vec3(radius * Math.sin(theta) * Math.cos(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(theta));
    modelViewMatrix = lookAt(eye, at , up);
    // An if statement is defined to change between perspective and parallel views.
    if (Perspective%2){    
        projectionMatrix = perspective(fovy, aspect, near, far);       
    }
    else
    {    
        projectionMatrix = ortho(left, right, bottom, top, near, far);
    }
    // Eventually, the codes below, create the final model:
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);

}

}
perspectiveExample();