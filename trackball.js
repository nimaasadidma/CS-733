
// First of all, we need to define variables needed for this implementation
let canvas;
let gl;
// we define these three variables for number of total positions and favorite colors
let numPositions  = 36;
let positions = [];
let colors = [];
//the below variables are defined to describe the rotation
let rotationMatrix;
let rotationMatrixLoc;
//The starting rotation angle and axis are also set
let  angle = 0.0;
let  axis = vec3(0, 0, 1);

let   trackingMouse = false;
let   trackballMove = false;

let lastPos = [0, 0, 0];
let curx, cury;
let startX, startY;

// Now, we need to define trackball
function trackballView( x,  y ) {
    let d, a;
    let v = [];

    v[0] = x;
    v[1] = y;

    d = v[0]*v[0] + v[1]*v[1];
    if (d < 1.0)
      v[2] = Math.sqrt(1.0 - d);
    else {
      v[2] = 0.0;
      a = 1.0 /  Math.sqrt(d);
      v[0] *= a;
      v[1] *= a;
    }
    return v;
}
// The mouse rotation is defined by a fuction like this:
function mouseMotion( x,  y)
{
    let dx, dy, dz;

    let curPos = trackballView(x, y);
    // different clauses are implemented for possible movenment of the mouse:
    if(trackingMouse) {
      dx = curPos[0] - lastPos[0];
      dy = curPos[1] - lastPos[1];
      dz = curPos[2] - lastPos[2];

      if (dx || dy || dz) {
	       angle = -0.1 * Math.sqrt(dx*dx + dy*dy + dz*dz);


	       axis[0] = lastPos[1]*curPos[2] - lastPos[2]*curPos[1];
	       axis[1] = lastPos[2]*curPos[0] - lastPos[0]*curPos[2];
	       axis[2] = lastPos[0]*curPos[1] - lastPos[1]*curPos[0];

         lastPos[0] = curPos[0];
	       lastPos[1] = curPos[1];
	       lastPos[2] = curPos[2];
      }
    }
    render();
}
// Also, a starting position is sent for the mouse so that the trackball knows hiow and where to rotate:
function startMotion( x,  y)
{
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
	  trackballMove=true;
}
// Another function is defined in order to stop the motion:
function stopMotion( x,  y)
{
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
	     angle = 0.0;
	     trackballMove = false;
    }
}

// Unload method is used to load the model
window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }
    
    gl.clearColor(0.5,0.5,0.5,1)

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);


    //  shaders and initialize attribute buffers are loaded through the following codes:
    
    let program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    let colorLoc = gl.getAttribLocation( program, "aColor");
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW);


    let positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc );

    rotationMatrix = mat4();
    rotationMatrixLoc = gl.getUniformLocation(program, "uRotationMatrix");
    gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));


    canvas.addEventListener("mousedown", function(event){
      let x = 2*event.clientX/canvas.width-1;
      let y = 2*(canvas.height-event.clientY)/canvas.height-1;
      startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function(event){
      let x = 2*event.clientX/canvas.width-1;
      let y = 2*(canvas.height-event.clientY)/canvas.height-1;
      stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function(event){

      let x = 2*event.clientX/canvas.width-1;
      let y = 2*(canvas.height-event.clientY)/canvas.height-1;
      mouseMotion(x, y);
    } );

    render();

}
// The colors for every surface of the cube is then defined.
function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}
// The below function is defined to describe the positions
function quad(a, b, c, d)
{
    let vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5,  0.5,  0.5, 1.0 ),
        vec4(  0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5,  0.5, -0.5, 1.0 ),
        vec4(  0.5, -0.5, -0.5, 1.0 )
    ];

    var vertexColors = [
      vec4( 1.0, 1.0, 1.0, 1.0 ),  // black
      vec4( 1.0, 0.5, 0.5, 1.0 ),  // red
      vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
      vec4( 0.0, 1.0, 0.0, 0.5 ),  // green
      vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
      vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
      vec4( 0.5, 1.0, 1.0, 1.0 ),  // cyan
      vec4( 1.0, 1.0, 1.0, 1.0 )   // white
    ];

    /* We need to parition the quad into two triangles in order for
    WebGL to be able to render it.  In this case, we create two triangles from the quad indices*/

    //vertex color assigned by the index of the vertex

    let indices = [ a, b, c, a, c, d ];

    for ( let i = 0; i < indices.length; ++i ) {
        positions.push(vertices[indices[i]]);

        // for interpolated colors use
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);
    }
}

// The final model is rendered using the following function
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if(trackballMove) {
      axis = normalize(axis);
      rotationMatrix = mult(rotationMatrix, rotate(angle, axis));
      gl.uniformMatrix4fv(rotationMatrixLoc, false, flatten(rotationMatrix));
    }
    gl.drawArrays( gl.TRIANGLES, 0, numPositions );
    requestAnimationFrame( render );
} 
