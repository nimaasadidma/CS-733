
// First of all, we need to define WebGL
let gl
// Then, we need to define variable
let positions = []
let colors = []

// we use the following function to launch events on the web page
window.onload = function init () {
  let canvas = document.getElementById('gl-canvas')
  gl = canvas.getContext('webgl2')
  if (gl) window.alert('Assignment 1, Chaos Game! Please hit Ok to continue!')
  if (!gl) window.alert('WebGL 2.0 is not available')
  else {
    console.log('ALL SET')
  }
  // Now, we need to define three points to draw a triangle
  let vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)]

  // we need to define three colors as well
  let vcolors = [vec4(1, 0.0, 0.0, 1), 
  	vec4(0.5,0.0,0.5,1.0), 
	  vec4(0.1, 1.0,0.1, 1.0)
  ]

  // we choose a vertex as a starting point and then add it to the postion array
  let p = vertices[2]
  positions.unshift(p)
  colors.unshift(vcolors[0])

  //we use a for loop to find the next position
  // every position is situated between two existing points
  // the vertes is randomly selected

  for (let i = 0; positions.length < 15000; i++) {
    let j = Math.floor(3 * Math.random())
    p = add( vertices[j], positions[i])
    p = mult(0.5, p)
    positions.push(p)
    //if unshift method is used, we will have combined colors in the output
    // but if push method is used, we will get three triangles with three different colors
    colors.unshift(vcolors[j])
  }

  // All set, we need to configure WebGL
  gl.viewport(1, 2, canvas.width, canvas.height)
  gl.clearColor(1, 1, 1, 1)

  // now, we need to load shaders and initialize attribute buffers
  let program = initShaders(gl, 'vertex-shader', 'fragment-shader')
  gl.useProgram(program)

  // we also must load the positions into the GPU
  let vbuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(positions), gl.STATIC_DRAW)

  // then, we need to associate shader variables with data buffer
  let positionLoc = gl.getAttribLocation(program, 'aPosition')
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(positionLoc)

  // afterwards, we load the colors into the GPU or CPU
  var cbuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, cbuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW)

  // before rendering, we mustassociate shader variables with data buffer
  let colorLoc = gl.getAttribLocation(program, 'aColor')
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(colorLoc)
  // we finally need to render the triangle
  render()
}

function render () {
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.drawArrays(gl.POINTS, 0, positions.length)
}