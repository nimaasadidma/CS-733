

let canvas
let gl
let positions = []
let colors = []

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (gl) {window.alert('Assignment 1, Sierpinski Gasket! Please hit Ok to continue!')}
    if (!gl) {window.alert('WebGL 2.0 is not available')}
    else {
      console.log('ALL SET')
    }
    //  Initialize our data for the Sierpinski Gasket
    // First, initialize the corners of our gasket with three positions.
    let vertices = [
        vec2( -1, -1 ),
        vec2(  0,  1 ),
        vec2(  1, -1 )
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2], 7);
    let vcolors = [vec4(0, 0.0, 0.0, 1), 
        vec4(0.5,0.5,0.5,1.0), 
        vec4(0.1, 1.0,0.1, 1.0)]

     // use the first vertex as the starting point, p
    let p = vertices[1]

  // push that starting point into the array of points
  // to be drawn
    positions.push(p)
    colors.push(vcolors[1])
    
    for (let i = 0; positions.length < 7; i++) {
        let j = Math.floor(3 * Math.random())
        p = add(positions[i], vertices[j])
        p = mult(0.5, p)
        positions.push(p)
        colors.push(vcolors[j])
    }

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram(program);

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW );



    // Associate out shader variables with our data buffer
    let positionLoc = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( positionLoc, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( positionLoc );

    // load the colours into the GPU
    let cbuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, cbuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)
    render();
};

function triangle(a, b, c)
{
    positions.push(a, b, c);
}

function divideTriangle(a, b, c, count)
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        let ab = mix( a, b, 0.5 );
        let ac = mix( a, c, 0.5 );
        let bc = mix( b, c, 0.5 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ac, count );
        divideTriangle( c, ac, bc, count );
        divideTriangle( b, bc, ab, count);
    }
}



function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, positions.length );
}

// associate shader variables with data buffer
let colorLoc = gl.getAttribLocation(program, 'aColor')
gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0)
gl.enableVertexAttribArray(colorLoc)
render()