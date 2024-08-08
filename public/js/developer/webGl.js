
class MDNCustom {

    // Define the data that is needed to make a 3d cube
    createCubeData = function() {
    
      var positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
  
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
  
        // Top face
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
  
        // Bottom face
        -1.0, -1.0, -1.0,
         1.0, -1.0, -1.0,
         1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
  
        // Right face
         1.0, -1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0,  1.0,  1.0,
         1.0, -1.0,  1.0,
  
        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0
      ];
    
      var colorsOfFaces = [
        [0.3,  1.0,  1.0,  1.0],    // Front face: cyan
        [1.0,  0.3,  0.3,  1.0],    // Back face: red
        [0.3,  1.0,  0.3,  1.0],    // Top face: green
        [0.3,  0.3,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.3,  1.0],    // Right face: yellow
        [1.0,  0.3,  1.0,  1.0]     // Left face: purple
      ];
    
      var colors = [];
  
      for (var j=0; j<6; j++) {
        var polygonColor = colorsOfFaces[j];
      
        for (var i=0; i<4; i++) {
          colors = colors.concat( polygonColor );
        }
      }
    
      var elements = [
        0,  1,  2,      0,  2,  3,    // front
        4,  5,  6,      4,  6,  7,    // back
        8,  9,  10,     8,  10, 11,   // top
        12, 13, 14,     12, 14, 15,   // bottom
        16, 17, 18,     16, 18, 19,   // right
        20, 21, 22,     20, 22, 23    // left
      ]
    
      return {
        positions: positions,
        elements: elements,
        colors: colors
      }
    }
  
    // Take the data for a cube and bind the buffers for it.
    // Return an object collection of the buffers
    createBuffersForCube = function( gl, cube ) {
    
      var positions = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positions);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.positions), gl.STATIC_DRAW);
    
      var colors = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colors);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);
    
      var elements = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.elements), gl.STATIC_DRAW);
    
      return {
        positions: positions,
        colors: colors,
        elements: elements
      }
    }
  
    matrixArrayToCssMatrix = function (array) {
      return "matrix3d(" + array.join(',') + ")";
    }
  
    multiplyPoint = function (matrix, point) {
    
      var x = point[0], y = point[1], z = point[2], w = point[3];
    
      var c1r1 = matrix[ 0], c2r1 = matrix[ 1], c3r1 = matrix[ 2], c4r1 = matrix[ 3],
          c1r2 = matrix[ 4], c2r2 = matrix[ 5], c3r2 = matrix[ 6], c4r2 = matrix[ 7],
          c1r3 = matrix[ 8], c2r3 = matrix[ 9], c3r3 = matrix[10], c4r3 = matrix[11],
          c1r4 = matrix[12], c2r4 = matrix[13], c3r4 = matrix[14], c4r4 = matrix[15];
    
      return [
        x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
        x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
        x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
        x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
      ];
    }
  
    multiplyMatrices = function (a, b) {
    
      // TODO - Simplify for explanation
      // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337
    
      var result = [];
    
      var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
          a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
          a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
          a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
  
      // Cache only the current line of the second matrix
      var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
      result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  
      b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
      result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  
      b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
      result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  
      b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
      result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
      result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
      result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
      result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
  
      return result;
    }
  
    multiplyArrayOfMatrices = function (matrices) {
    
      var inputMatrix = matrices[0];
    
      for(var i=1; i < matrices.length; i++) {
        inputMatrix = this.multiplyMatrices(inputMatrix, matrices[i]);
      }
    
      return inputMatrix;
    }
  
    rotateXMatrix = function (a) {
    
      var cos = Math.cos;
      var sin = Math.sin;
    
      return [
           1,       0,        0,     0,
           0,  cos(a),  -sin(a),     0,
           0,  sin(a),   cos(a),     0,
           0,       0,        0,     1
      ];
    }
  
    rotateYMatrix = function (a) {
  
      var cos = Math.cos;
      var sin = Math.sin;
    
      return [
         cos(a),   0, sin(a),   0,
              0,   1,      0,   0,
        -sin(a),   0, cos(a),   0,
              0,   0,      0,   1
      ];
    }
  
    rotateZMatrix = function (a) {
  
      var cos = Math.cos;
      var sin = Math.sin;
    
      return [
        cos(a), -sin(a),    0,    0,
        sin(a),  cos(a),    0,    0,
             0,       0,    1,    0,
             0,       0,    0,    1
      ];
    }
  
    translateMatrix = function (x, y, z) {
        return [
            1,    0,    0,   0,
            0,    1,    0,   0,
            0,    0,    1,   0,
            x,    y,    z,   1
        ];
    }
  
    scaleMatrix = function (w, h, d) {
        return [
            w,    0,    0,   0,
            0,    h,    0,   0,
            0,    0,    d,   0,
            0,    0,    0,   1
        ];
    }
  
    perspectiveMatrix = function (fieldOfViewInRadians, aspectRatio, near, far) {
    
      // Construct a perspective matrix
    
      /*
         Field of view - the angle in radians of what's in view along the Y axis
         Aspect Ratio - the ratio of the canvas, typically canvas.width / canvas.height
         Near - Anything before this point in the Z direction gets clipped (outside of the clip space)
         Far - Anything after this point in the Z direction gets clipped (outside of the clip space)
      */
    
      var f = 1.0 / Math.tan(fieldOfViewInRadians / 2);
      var rangeInv = 1 / (near - far);
   
      return [
        f / aspectRatio, 0,                          0,   0,
        0,               f,                          0,   0,
        0,               0,    (near + far) * rangeInv,  -1,
        0,               0,  near * far * rangeInv * 2,   0
      ];
    }
  
    orthographicMatrix = function(left, right, bottom, top, near, far) {
    
      // Each of the parameters represents the plane of the bounding box
    
      var lr = 1 / (left - right);
      var bt = 1 / (bottom - top);
      var nf = 1 / (near - far);
      
      var row4col1 = (left + right) * lr;
      var row4col2 = (top + bottom) * bt;
      var row4col3 = (far + near) * nf;
    
      return [
         -2 * lr,        0,        0, 0,
               0,  -2 * bt,        0, 0,
               0,        0,   2 * nf, 0,
        row4col1, row4col2, row4col3, 1
      ];
    }
  
    createShader = function (gl, source, type) {
    
      // Compiles either a shader of type gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
    
      var shader = gl.createShader( type );

      console.log({shader, source, type});

      gl.shaderSource( shader, source );
      gl.compileShader( shader );
  
      if ( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
      
        var info = gl.getShaderInfoLog( shader );
        throw "Could not compile WebGL program. \n\n" + info;
      }
  
      return shader
    }
  
    linkProgram = function (gl, vertexShader, fragmentShader) {
  
      var program = gl.createProgram();

      console.log({program});
  
      gl.attachShader( program, vertexShader );
      gl.attachShader( program, fragmentShader );
  
      gl.linkProgram( program );
  
      if ( !gl.getProgramParameter( program, gl.LINK_STATUS) ) {
        var info = gl.getProgramInfoLog(program);
        throw "Could not compile WebGL program. \n\n" + info;
      }
    
      return program;
    }
  
    createWebGLProgram = function (gl, vertexSource, fragmentSource) {
  
      // Combines MDN.createShader() and MDN.linkProgram()

      var {vertexSource_, fragmentSource_} = this.codeGLSL();
    
      var vertexShader = this.createShader( gl, vertexSource_, gl.VERTEX_SHADER );
      var fragmentShader = this.createShader( gl, fragmentSource_, gl.FRAGMENT_SHADER );

      console.log({vertexShader, fragmentShader});
        
      return this.linkProgram( gl, vertexShader, fragmentShader );
    }
  
    createWebGLProgramFromIds = function (gl, vertexSourceId, fragmentSourceId) {
    
        var vertexSourceEl = document.getElementById(vertexSourceId);
        var fragmentSourceEl = document.getElementById(fragmentSourceId);

        console.log({vertexSourceEl, fragmentSourceEl});

    
        return this.createWebGLProgram(
            gl,
            vertexSourceEl.innerHTML,
            fragmentSourceEl.innerHTML
        );
    }
  
    createContext = function (canvas) {

        var gl;
        try {
            // Try to grab the standard context. If it fails, fallback to experimental.
            gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
        }
        catch(e) {}
        
        // If we don't have a GL context, give up now
        if (!gl) {
            var message = "Unable to initialize WebGL. Your browser may not support it.";
            alert(message);
            throw new Error(message);
            gl = null;
        }

        console.log({getContextAttributes: gl.getContextAttributes(), isContextLost: gl.isContextLost()});
        
        return gl;
    }

    codeGLSL = function () {

        const vsSource = `
            attribute vec3 position;
            attribute vec4 color;
            uniform mat4 model;
            varying vec4 vColor;
        
        
            void main() {
                vColor = color;
                gl_Position = vec4(position, 1.0); // Draw the vertices
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec4 vColor;
            uniform vec4 color;
            
            void main() {
                gl_FragColor = color; // color from the uniform
            }
        `;

        const vsSourceCube = `
            attribute vec3 position;
            attribute vec4 color;
            uniform mat4 model;
            varying vec4 vColor;
        
        
            void main() {
                vColor = color;

                // ---------------------------------------------

                // gl_Position = model * vec4(position, 1.0); // Draw the vertices cube model
                // gl_Position = vec4(position, 1.0); // Draw the vertices

                // ---------------------------------------------

                // First transform the point
                vec4 transformedPosition = model * vec4(position, 1.0);

                // How much effect does the perspective have?
                float scaleFactor = 0.5;

                // Set w by taking the z value which is typically ranged -1 to 1, then scale
                // it to be from 0 to some number, in this case 0-1.
                float w = (1.0 + transformedPosition.z) * scaleFactor;

                // Save the new gl_Position with the custom w component
                gl_Position = vec4(transformedPosition.xyz, w);

                // ---------------------------------------------
                
            }
        `;

        const fsSourceCube = `
            precision mediump float;
            varying vec4 vColor;
            uniform vec4 color;
            
            void main() {
                //gl_FragColor = color; // color from the uniform
                gl_FragColor = vColor; // color from the vertex shader
                //gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // red
            }
        `;

        // Vertex shader program
        const vsSourceA = `
            attribute vec4 aVertexPosition;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main() {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            }
        `;

        const fsSourceA = `
            void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            }
        `;

        const vertexShaderSource = `#version 300 es
        in vec4 a_position;
        void main() {
          gl_Position = a_position;
        }`;

        // Fragment shader source
        const fragmentShaderSource = `#version 300 es
        precision highp float;
        precision highp sampler3D; // Specify precision for sampler3D
        uniform sampler3D u_texture;
        out vec4 outColor;
        void main() {
            // Sample the texture at a normalized coordinate
            vec3 texCoord = vec3(0.5, 0.5, 0.5);
            outColor = texture(u_texture, texCoord);
        }`;


        const vRotation= `
            attribute vec2 aVertexPosition;
            uniform vec2 uScalingFactor;
            uniform vec2 uRotationVector;

            void main() {
                vec2 rotatedPosition = vec2(
                aVertexPosition.x * uRotationVector.y +
                        aVertexPosition.y * uRotationVector.x,
                aVertexPosition.y * uRotationVector.y -
                        aVertexPosition.x * uRotationVector.x
                );

                gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0);
            }
        
        ` 

        const fRotation= `

            #ifdef GL_ES
                precision highp float;
            #endif

            uniform vec4 uGlobalColor;

            void main() {
                gl_FragColor = uGlobalColor;
            }

        `

        const trianglesTestV = `
        attribute vec2 a_position;

        uniform mat3 u_matrix;

        varying vec4 v_color;

        void main() {
            // Multiply the position by the matrix.
            gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);

            // Convert from clipspace to colorspace.
            // Clipspace goes -1.0 to +1.0
            // Colorspace goes from 0.0 to 1.0
            v_color = gl_Position * 0.5 + 0.5;
        }

        `

        const trianglesTestF = `
            precision mediump float;

            varying vec4 v_color;

            void main() {
                gl_FragColor = v_color;
            }

        `

        const modelTestVert = `
            attribute vec3  a_position;
            uniform   mat3  u_matrix;
            attribute vec4  aVertexColor;
            varying   vec4  v_color;

            void main() {

                // Multiply the position by the matrix.
                gl_Position = vec4(a_position, 1.0);

                // colorspace 
                // v_color = vec4(1.0, 1.0, 1.0, 1.0);
                v_color = aVertexColor;
            }

        `

        const modelTestFrag = `
            precision mediump float;
            varying   vec4    v_color;

            void main() {
                gl_FragColor = v_color;
            }

        `

        return {vertexSource_: modelTestVert, fragmentSource_: modelTestFrag};


    }

}


class CubeDemo {
    constructor(mdn, gl) {
        this.gl = gl;
        this.mdn = mdn;
        this.transforms = {};
        this.locations = {};
    }

    computeModelMatrix = function (now) {
        const mdn = this.mdn;
        //Scale down by 50%
        // const scale = mdn.scaleMatrix(0.5, 0.5, 0.5);

        //Scale down by 30%
        var scale = this.mdn.scaleMatrix(0.2, 0.2, 0.2);
      
        // Rotate a slight tilt
        const rotateX = mdn.rotateXMatrix(now * 0.0003);
      
        // Rotate according to time
        const rotateY = mdn.rotateYMatrix(now * 0.0005);
      
        // Move slightly down
        const position = mdn.translateMatrix(0, -0.1, 0);
      
        // Multiply together, make sure and read them in opposite order
        this.transforms.model = mdn.multiplyArrayOfMatrices([
          position, // step 4
          rotateY, // step 3
          rotateX, // step 2
          scale, // step 1
        ]);

        // console.log({ transforms: this.transforms, locations: this.locations});

        return {
            mdn,
            transforms: this.transforms,
            position,
            rotateX,
            rotateY,
            scale,
        };

        
    };

    updateAttributesAndUniforms = function() {

        var gl = this.gl;
        
        // Setup the color uniform that will be shared across all triangles
        gl.uniformMatrix4fv(this.locations.model, false, new Float32Array(this.transforms.model));
        
        // Set the positions attribute
        gl.enableVertexAttribArray(this.locations.position);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.positions);
        gl.vertexAttribPointer(this.locations.position, 3, gl.FLOAT, false, 0, 0);
        
        // Set the colors attribute
        gl.enableVertexAttribArray(this.locations.color);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colors);
        gl.vertexAttribPointer(this.locations.color, 4, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.elements );
        
    };

    draw = function() {

        if(!this.debug) {
            console.log(`%c[CubeDemo.draw]`, `background: rgb(150 155 0 / 100%); color: #fff;`);
            console.log({now: Date.now(), TRIANGLES: this.gl.TRIANGLES, UNSIGNED_SHORT: this.gl.UNSIGNED_SHORT});
            this.debug =true;
        };
  
        var gl = this.gl;
        var now = Date.now();
        
        // Compute our matrices
        this.computeModelMatrix( now );
        
        // Update the data going to the GPU
        this.updateAttributesAndUniforms();
        
        // Perform the actual draw
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        
        // Run the draw as a loop
        requestAnimationFrame( this.draw.bind(this) );
    };
      
}

class WebGLCustomer  {
    constructor() {
        this.mdn = new MDNCustom();
        this.root = document.querySelector("#root");
        this.gl = null;
        this.canvas = null;
        this.program = null;
        this.positionLocation = null;
        this.colorLocation = null;
        this.canvasWidth = 640;
        this.canvasHeight = 480;

        console.log({mdn: this.mdn});

        this.cubeDemo = new CubeDemo(this.mdn);

        return this;
    }


    createStarVertices(outerRadius, innerRadius, numPoints) {
        const vertices = [];
        const step = Math.PI / numPoints;
    
        for (let i = 0; i < 2 * numPoints; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = i * step;
            vertices.push(radius * Math.cos(angle), radius * Math.sin(angle), 0.0);
        }
    
        return vertices;
    }

    generateStarIndices(numPoints) {
        const indices = [];
        for (let i = 0; i < numPoints * 2; i++) {
            indices.push(i, (i + 1) % (numPoints * 2), (i + 2) % (numPoints * 2));
        }
        return indices;
    }

    isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    initTextureBuffer(gl) {
        const textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
      
        const textureCoordinates = [
          // Front
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Back
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Top
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Bottom
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Right
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
          // Left
          0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
        ];
      
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(textureCoordinates),
          gl.STATIC_DRAW,
        );
      
        return textureCoordBuffer;
      }


    init() {

        console.log(`%c[WebGLCustomer.Init]`, `background: green; color: #fff;`);

        this.createElementCanvas();
        this.checkWebGL();

      
        this.webGLBox()
          
   
        console.log(`%c[WebGLCustomer.Init End]`, `background: rgb(0 0 255 / 100%); color: #fff;`);
        this.clearDraw();

        const texture = this.loadTexture(this.gl, 'http://localhost:8080/img.png');

        
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        const textureCoordBuffer = this.initTextureBuffer(this.gl);
        console.log({texture, textureCoordBuffer});


        this.testGeometry();

        // this.buldAnimationRotation();

        // this.drawTexture();
  
        // this.draw({
        //     top: 1.0, // x
        //     bottom: 0, // x
        //     left: 0, // y
        //     right: 1.0, // y

        //     w: 0.0, // w - enlarge this box

        //     depth: 0, // z
        //     color: [1, 0.0, 0.0, 1], // red
        // });

        // this.testDraw();
        // this.cubeDemo.draw(this.cubeDemo)

        
        // this.gl.texImage3D(
        //     this.gl.TEXTURE_3D,
        //     0, // level
        //     this.gl.RGBA, // internalFormat
        //     1, // width
        //     1, // height
        //     1, // depth
        //     0, // border
        //     this.gl.RGBA, // format
        //     this.gl.UNSIGNED_BYTE, // type
        //     new Uint8Array([0xff, 0x00, 0x00, 0x00]),
        //   )


    
       
       

        const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        let identityPoint = this.mdn.multiplyPoint(identity, [2, 3, 4, 1]);
        const copyZ = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0]; // Em seguida, mova o 1 da última coluna um espaço para cima.
        let copyZPoint = this.mdn.multiplyPoint(copyZ, [2, 3, 4, 1]);

        console.log({identityA: identity, identityB: copyZ, pointA: identityPoint, pointB: copyZPoint});



        return this;
    }

    loadTexture(gl, url) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
      
        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        gl.texImage2D(
          gl.TEXTURE_2D,
          level,
          internalFormat,
          width,
          height,
          border,
          srcFormat,
          srcType,
          pixel,
        );
      
        const image = new Image();
        image.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
          );
      
          // WebGL1 has different requirements for power of 2 images
          // vs. non power of 2 images so check if the image is a
          // power of 2 in both dimensions.
          if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
          } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          }
        };
        image.src = url;
      
        return texture;
      }

    testGeometry() {
        let verticesSquare = [
            -0.5, 0.5, 0.0,
             0.5, 0.5, 0.0,
             0.5, -0.5, 0.0,
            -0.5, -0.5, 0.0,
        ];

        let verticesTriangle = [
            0.0, 0.5, 0.0,
           -0.5, -0.5, 0.0,
            0.5, -0.5, 0.0,
        ];

        let verticesCube = [

            -0.5, -0.5,  0.5,
             0.5, -0.5,  0.5,
             0.5,  0.5,  0.5,
            -0.5,  0.5,  0.5,

            -0.5, -0.5, -0.5,
            0.5, -0.5, -0.5,
            0.5,  0.5, -0.5,
           -0.5,  0.5, -0.5,

           -0.5, -0.5,  0.5,
            0.5, -0.5,  0.5,
            0.5, -0.5, -0.5,
           -0.5, -0.5, -0.5,

           -0.5,  0.5,  0.5,
            0.5,  0.5,  0.5,
            0.5,  0.5, -0.5,
           -0.5,  0.5, -0.5,
           
           -0.5, -0.5,  0.5,
           -0.5,  0.5,  0.5,
           -0.5,  0.5, -0.5,
           -0.5, -0.5, -0.5,
            0.5, -0.5,  0.5,
            0.5,  0.5,  0.5,
            0.5,  0.5, -0.5,
            0.5, -0.5, -0.5,
           
        ];

        const vertexColors = [
            0.0, 0.0, 0.0, 1.0, // black
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 1.0, 0.0, 1.0, // yellow
            0.0, 1.0, 0.0, 1.0, // green
            0.0, 0.0, 0.0, 1.0, // black
            1.0, 0.0, 0.0, 1.0, // red
            1.0, 1.0, 0.0, 1.0, // yellow
            0.0, 1.0, 0.0, 1.0, // green
          ];
          
        let verticesStar = this.createStarVertices(0.5, 0.2, 5);
        

        // this.creatModelVertexBuffer(verticesStar, this.generateStarIndices(5));
        this.creatModelVertexBuffer(verticesCube, null, vertexColors);


    }



    webGLBox() {

        console.log(`%c[WebGLCustomer.webGLBox]`, `background: rgb(0 255 0 / 84%); color: #fff;`);


        this.buffers = this.mdn.createBuffersForCube(this.gl, this.mdn.createCubeData() );

        this.webglProgram = this.mdn.createWebGLProgramFromIds(
            this.gl,
            "vertex-shader",
            "fragment-shader",
        );

        console.log({webglProgram: this.webglProgram});

        this.gl.useProgram(this.webglProgram);


        this.readVariablesGLSL();


        /* 
        * A função gl.enable(this.gl.DEPTH_TEST) ativa o teste de profundidade (depth test) no WebGL. Isso significa que, 
        * ao desenhar objetos na tela, o WebGL levará em consideração a profundidade dos pixels (a posição z) 
        * para determinar quais objetos estão na frente e quais estão atrás.
        */
       // Ativar o teste de profundidade
        this.gl.enable(this.gl.DEPTH_TEST);
        // Configurar a função de comparação do teste de profundidade (opcional)
        // Isso define como o WebGL compara as profundidades dos fragmentos
        this.gl.depthFunc(this.gl.LEQUAL); // Configura para aceitar fragmentos que são menores ou iguais ao valor do buffer de profundidade atual
        // Agora, quando você desenhar seus objetos, o WebGL considerará a profundidade dos mesmos


        // turn on scissor test
        this.gl.enable(this.gl.SCISSOR_TEST)
        this.gl.scissor(0, 0, this.canvasWidth, this.canvasHeight);


        // this.gl.activeTexture(this.gl.TEXTURE1);
        // this.gl.getParameter(this.gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
        // this.gl.activeTexture(this.gl.TEXTURE0);
        // console.log({
        //     ACTIVE_TEXTURE: this.gl.getParameter(this.gl.ACTIVE_TEXTURE)
        // });
        // this.gl.blendColor(0, 0.5, 1, 1);

        console.log({
            positionLocation : this.positionLocation, 
            colorLocation : this.colorLocation, 
            model : this.cubeDemo.locations.model,
            locations: this.cubeDemo.locations,
            transforms: this.cubeDemo.transforms
        });

        return this;
    }

    testDraw() {
        this.draw({
            top: 0.5, // x
            bottom: -0.5, // x
            left: -0.5, // y
            right: 0.5, // y

            w: 0.7, // w - enlarge this box

            depth: 0, // z
            color: [1, 0.4, 0.4, 1], // red
          })
          .draw({
            top: 0.9, // x
            bottom: 0, // x
            left: -0.9, // y
            right: 0.9, // y
          
            w: 1.1, // w - shrink this box

            depth: 0.5, // z
            color: [0.4, 1, 0.4, 1], // green
          })
          .draw({
            top: 1, // x
            bottom: -1, // x
            left: -1, // y
            right: 1, // y

            w: 1.5, // w - Bring this box into range
          
            depth: -1.5, // z
            color: [0.4, 0.4, 1, 1], // blue
          });

          return this;
    }

    createElementCanvas() {

        console.log(`%c[WebGLCustomer.createElementCanvas]`, `background: rgb(0 0 255 / 84%); color: #fff;`);

        const canvas = document.createElement("canvas");
        canvas.id = "glcanvas";
        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        this.root.appendChild(canvas);
        // this.gl = canvas.getContext("webgl");
        this.gl = this.mdn.createContext(canvas);

        this.cubeDemo.gl = this.gl;

        console.log({gl: this.gl});

        // Create and bind texture


        return this;
    }

    checkWebGL() {

        console.log(`%c[WebGLCustomer.checkWebGL]`, `background: rgb(0 80 0 / 84%); color: #fff;`);

        if (!this.gl) {
            alert("WebGL isn't available");
        }

        const debugInfo = this.gl.getExtension("WEBGL_debug_renderer_info");
        const vendor = this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        console.log({vendor, debugInfo, gl: this.gl});
    }

    readVariablesGLSL() {

        console.log(`%c[WebGLCustomer.readVariablesGLSL]`, `background: rgb(150 0 0 / 84%); color: #fff;`);

        const programInfo = {
            buffers: this.buffers,
            program: this.webglProgram,
            cube: {
                buffers: this.buffers,
                attribLocations: {
                    position: this.gl.getAttribLocation(this.webglProgram, "position"),
                    color: this.gl.getAttribLocation(this.webglProgram, "color")
                },
                uniformLocations: {
                    model: this.gl.getUniformLocation(this.webglProgram, "model"),
                },
            },
            rotationSample: {

                buffers: this.buffers,
                attribLocations: {
                    position: this.gl.getAttribLocation(this.webglProgram, "aVertexPosition"),
                    color: this.gl.getAttribLocation(this.webglProgram, "color")
                },
                uniformLocations: {
                    scale: this.gl.getUniformLocation(this.webglProgram, "uScalingFactor"),
                    globalColor: this.gl.getUniformLocation(this.webglProgram, "uGlobalColor"),
                    rotation: this.gl.getUniformLocation(this.webglProgram, "uRotationVector"),
                },
                customUniformLocations: {
                    currentAngle: null,
                    previousTime:0.0,
                    degreesPerSecond :90.0,
                    aspectRatio : null,
                    currentRotation : [0, 1],
                    currentScale : [1.0, 1.0],
                    vertexNumComponents: null,
                    vertexCount: null,
                    vertexArray: null,
                    vertexBuffer: null,
                    aVertexPosition: null
                }
            },
            crontrolTringleSample: {

                buffers: this.buffers,
                attribLocations: {
                    position: this.gl.getAttribLocation(this.webglProgram, "a_position"),
                    color: this.gl.getAttribLocation(this.webglProgram, "color")
                },
                uniformLocations: {
                    matrixLocation: this.gl.getUniformLocation(this.webglProgram, "u_matrix"),
                },
            },
        
            attribLocations: {
                position: this.gl.getAttribLocation(this.webglProgram, "position"),
                vertexPosition: this.gl.getAttribLocation(this.webglProgram, "aVertexPosition"),
                textureCoord: this.gl.getAttribLocation(this.webglProgram, "aTextureCoord"),
                
            },
            uniformLocations: {
                color: this.gl.getUniformLocation(this.webglProgram, "color"),
                texture: this.gl.getUniformLocation(this.webglProgram, 'u_texture'),
                projectionMatrix: this.gl.getUniformLocation(this.webglProgram, "uProjectionMatrix"),
                modelViewMatrix: this.gl.getUniformLocation(this.webglProgram, "uModelViewMatrix"),
                uSampler: this.gl.getUniformLocation(this.webglProgram, "uSampler"),
            },
        };

        this.programInfo = programInfo;


        // Save the attribute and uniform locations
        this.cubeDemo.buffers               = programInfo.buffers;
        this.cubeDemo.locations.model       = programInfo.cube.uniformLocations.model;
        this.cubeDemo.locations.position    = programInfo.cube.attribLocations.position;
        this.cubeDemo.locations.color       = programInfo.cube.attribLocations.color;

        this.positionLocation               = programInfo.attribLocations.position;
        this.colorLocation                  = programInfo.uniformLocations.color;
        this.textureLocation                = programInfo.uniformLocations.texture;


  
        console.log({programInfo});

        return this;
    }

    generateIndices(vertices) {
        const uniqueVertices = [];
        const indices = [];
        const vertexMap = {};

        for (let i = 0; i < vertices.length; i += 3) {
            const vertex = vertices.slice(i, i + 3);
            const key = vertex.join(',');

            if (vertexMap[key] === undefined) {
                uniqueVertices.push(...vertex);
                vertexMap[key] = uniqueVertices.length / 3 - 1;
            }

            indices.push(vertexMap[key]);
        }

        return { uniqueVertices, indices };
    }

    creatModelVertexBuffer(verticesSquare, indicesCustom = null, vertexColors = null) {
        var gl = this.gl;
        console.log(`%c[WebGLCustomer.creatModelVertexBuffer]`, `background: rgb(0 0 255 / 84%); color: #fff;`);
        
        var { uniqueVertices, indices } = this.generateIndices(verticesSquare)
        indices = indicesCustom || indices;

        // Definindo os vértices de um quadrado
        let vertexArray = new Float32Array(uniqueVertices);
        let indexArray =  new Uint16Array(indices);
    
        // Criando e preenchendo o buffer de vértices
        let vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
    
        // Criando e preenchendo o buffer de índices
        let indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArray, gl.STATIC_DRAW);
    
        // Habilitando e configurando o atributo de posição do vértice
        gl.enableVertexAttribArray(this.programInfo.rotationSample.uniformLocations.aVertexPosition);
        gl.vertexAttribPointer(
            this.programInfo.rotationSample.uniformLocations.aVertexPosition,
            3, // número de componentes por vértice
            gl.FLOAT, // tipo de dados dos componentes
            false, // normalização
            0, // stride (0 = próximo vértice continua imediatamente após o anterior)
            0 // offset no buffer
        );

           // Verificando se as cores dos vértices foram fornecidas
        if (vertexColors) {
            // Criando e preenchendo o buffer de cores
            const cBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
            
            // Obtendo a localização do atributo de cores no shader
     
            const colorAttributeLocation = gl.getAttribLocation(this.webglProgram, 'aVertexColor');
            // Habilitando o atributo de cores
            gl.enableVertexAttribArray(colorAttributeLocation);
            
            // Configurando o vertexAttribPointer para o buffer de cores
            gl.vertexAttribPointer(
                colorAttributeLocation,
                4, // número de componentes por vértice (r, g, b, a)
                gl.FLOAT, // tipo de dados dos componentes
                false, // normalização
                0, // stride (0 = próximo vértice continua imediatamente após o anterior)
                0 // offset no buffer
            );
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        // Desenhando os elementos
        gl.drawElements(gl.TRIANGLES, indexArray.length, gl.UNSIGNED_SHORT, 0);
      
    }

    draw_deprecated(settings) {
        // Set clear color to black, fully opaque
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    clearDraw() {
        // Set clear color to black, fully opaque
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    drawTexture(){

        // Create a buffer and put a single clipspace rectangle in it (2 triangles)
        const positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer( this.gl.ARRAY_BUFFER, positionBuffer);
        const positions = [
            -1.0, -1.0,
            1.0, -1.0,
            -1.0,  1.0,
            -1.0,  1.0,
            1.0, -1.0,
            1.0,  1.0,
        ];
        this.gl.bufferData( this.gl.ARRAY_BUFFER, new Float32Array(positions),  this.gl.STATIC_DRAW);

  
         // Setup the pointer to our attribute data (the triangles)
         this.gl.enableVertexAttribArray(this.positionLocation);
         this.gl.vertexAttribPointer(this.positionLocation, 2, this.gl.FLOAT, false, 0, 0);
         
        
        var texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_3D, texture);
          // Define the 3D texture data
        const width = 1;
        const height = 1;
        const depth = 1;
        const data = new Uint8Array([0xff, 0x00, 0x00, 0x00]); // Red with 0 alpha

        // Specify the 3D texture
        this.gl.texImage3D(
            this.gl.TEXTURE_3D,
            0, // Level of detail
            this.gl.RGBA, // Internal format
            width,
            height,
            depth,
            0, // Border
            this.gl.RGBA, // Format
            this.gl.UNSIGNED_BYTE, // Type
            data
        );

        // Set texture parameters
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_WRAP_R, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_3D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

        this.gl.uniform1i(this.textureLocation, 0);
        
        console.log({texture});

         // Draw the rectangle
         this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
         this.gl.clear(this.gl.COLOR_BUFFER_BIT);
         this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }


    buldAnimationRotation(){
        var gl = this.gl;
        let {
            aspectRatio, 
            currentRotation, 
            currentScale, 
            vertexArray, 
            vertexBuffer, 
            vertexNumComponents, 
            vertexCount, 
            currentAngle
        } = this.programInfo.rotationSample.customUniformLocations;

        aspectRatio = this.canvasWidth / this.canvasHeight;
        currentRotation = [0, 1];
        currentScale = [1.0, aspectRatio];

        // quadrado model
        vertexArray = new Float32Array([
            -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5,
        ]);

          ;

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

        console.log({vertexArray, vertexBuffer})

    
        vertexNumComponents = 2;
        vertexCount = vertexArray.length / vertexNumComponents;
        currentAngle = 0.0;

        Object.assign(this.programInfo.rotationSample.customUniformLocations, {
            aspectRatio,
            currentRotation,
            currentScale,
            vertexArray,
            vertexBuffer,
            vertexNumComponents,
            vertexCount,
            currentAngle,
        });
        

        this.animateScene();
    }

    animateScene() {

        console.log(`%c[WebGLCustomer.animateScene]`, `background: rgb(0 0 255 / 84%); color: #fff;`);

        var gl = this.gl;

        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        gl.clearColor(0.8, 0.9, 1.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // console.log({canvasWidth : this.canvasWidth, canvasHeight: this.canvasHeight});
      
        const radians = (this.programInfo.rotationSample.customUniformLocations.currentAngle * Math.PI) / 180.0;
        this.programInfo.rotationSample.customUniformLocations.currentRotation[0] = Math.sin(radians);
        this.programInfo.rotationSample.customUniformLocations.currentRotation[1] = Math.cos(radians);
      
      
        gl.uniform2fv(this.programInfo.rotationSample.uniformLocations.scale, this.programInfo.rotationSample.customUniformLocations.currentScale);
        gl.uniform2fv(this.programInfo.rotationSample.uniformLocations.rotation, this.programInfo.rotationSample.customUniformLocations.currentRotation);
        gl.uniform4fv(this.programInfo.rotationSample.uniformLocations.globalColor, [0.1, 0.7, 0.2, 1.0]);
      
        gl.bindBuffer(gl.ARRAY_BUFFER, this.programInfo.rotationSample.customUniformLocations.vertexBuffer);
      
    
      
        gl.enableVertexAttribArray(this.programInfo.rotationSample.uniformLocations.aVertexPosition);
        gl.vertexAttribPointer(
            this.programInfo.rotationSample.uniformLocations.aVertexPosition,
            this.programInfo.rotationSample.customUniformLocations.vertexNumComponents,
            gl.FLOAT,
            false,
            0,
            0,
        );
      
        gl.drawArrays(gl.TRIANGLES, 0, this.programInfo.rotationSample.customUniformLocations.vertexCount);
      
        requestAnimationFrame((currentTime) => {
          const deltaAngle =
            ((currentTime - this.programInfo.rotationSample.customUniformLocations.previousTime) / 1000.0) * this.programInfo.rotationSample.customUniformLocations.degreesPerSecond;
      
            this.programInfo.rotationSample.customUniformLocations.currentAngle = (this.programInfo.rotationSample.customUniformLocations.currentAngle + deltaAngle) % 360;
      
            this.programInfo.rotationSample.customUniformLocations.previousTime = currentTime;
          
           this.animateScene();
        });
    }

    draw(settings){

        if(!this.debug) {
            console.log(`%c[WebGLCustomer.draw]`, `background: rgb(150 0 0 / 84%); color: #fff;`);
            this.debug =true;
        };

        const gl = this.gl;
        // Create some attribute data; these are the triangles that will end being
        // drawn to the screen. There are two that form a square.
        const data__ = new Float32Array([
            //Triangle 1
            settings.left,
            settings.bottom,
            settings.depth,
            settings.right,
            settings.bottom,
            settings.depth,
            settings.left,
            settings.top,
            settings.depth,

            //Triangle 2
            settings.left,
            settings.top,
            settings.depth,
            settings.right,
            settings.bottom,
            settings.depth,
            settings.right,
            settings.top,
            settings.depth,
        ]);

        const data = new Float32Array([
            //Triangle 1
            settings.left,
            settings.bottom,
            settings.depth,
            settings.w,
            settings.right,
            settings.bottom,
            settings.depth,
            settings.w,
            settings.left,
            settings.top,
            settings.depth,
            settings.w,
          
            //Triangle 2
            settings.left,
            settings.top,
            settings.depth,
            settings.w,
            settings.right,
            settings.bottom,
            settings.depth,
            settings.w,
            settings.right,
            settings.top,
            settings.depth,
            settings.w,
        ]);

       



        // Use WebGL to draw this onto the screen.

        // Performance Note: Creating a new array buffer for every draw call is slow.
        // This function is for illustration purposes only.

        // Create a buffer and bind the data
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

        console.log({settings, data, positionLocation: this.positionLocation, colorLocation: this.colorLocation });

        // Setup the pointer to our attribute data (the triangles)
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 3, gl.FLOAT, false, 0, 0);

        // Setup the color uniform that will be shared across all triangles
        gl.uniform4fv(this.colorLocation, settings.color);

        // Draw the triangles to the screen
        // gl.drawArrays(gl.TRIANGLES, 0, 6);

        console.log({
            POINTS: gl.POINTS,
            LINES:gl.LINES,
            LINE_LOOP: gl.LINE_LOOP,
            LINE_STRIP: gl.LINE_STRIP,
            TRIANGLES: gl.TRIANGLES,
            TRIANGLE_STRIP: gl.TRIANGLE_STRIP,
            TRIANGLE_FAN: gl.TRIANGLE_FAN,
            UNSIGNED_SHORT: gl.UNSIGNED_SHORT,
            UNSIGNED_BYTE: gl.UNSIGNED_BYTE
        });


     

        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
        // gl.drawElements(gl.LINE_STRIP, 36, gl.UNSIGNED_SHORT, 0);
      




        // console.log({data, buffer, texture, TEXTURE_3D: gl.TEXTURE_3D});

 

        return this;
    }

    cartesianToHomogeneous(point) {
        let x = point[0];
        let y = point[1];
        let z = point[2];
      
        return [x, y, z, 1];
    }
      
    homogeneousToCartesian(point) {
    let x = point[0];
    let y = point[1];
    let z = point[2];
    let w = point[3];
    
    return [x / w, y / w, z / w];
    }

}



new WebGLCustomer().init()
