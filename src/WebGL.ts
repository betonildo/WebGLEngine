
/// <reference path="Shader.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="ShaderAttribute.ts" />
/// <reference path="WebGLCurrentContext.ts" />
/// <reference path="ShaderPreprocessor.ts" />

function InitGL(){

    ShaderPreprocessor.setShaderModuleSource("mesh", "attribute vec3 position_model_space;");
    ShaderPreprocessor.setShaderModuleSource("frag_basic", "uniform sampler2D a_texture;")

    let webglCanvas = document.createElement("canvas") as HTMLCanvasElement;
    document.body.appendChild(webglCanvas);
    webglCanvas.width = 320;
    webglCanvas.height = 240;
    webglCanvas.style.display = "block";
    
    var gl = webglCanvas.getContext("webgl") as WebGLRenderingContext;

    WebGLCurrentContext.set(gl);

    /* Step2: Define the geometry and store it in buffer objects */


    /* Step3: Create and compile Shader programs */

    var simpleShader = new Shader();

    // Vertex shader source code
    var vertCode = [
    '#include <mesh>',
    'varying vec2 textureCoordinate;',
    'void main(void) {',
        'textureCoordinate = position_model_space.xy;',
        'gl_Position = vec4(position_model_space, 1.0);',
        
    '}'].join('\n');

    var fragCode = [
    'precision mediump float;',
    '#include <frag_basic>',
    'varying vec2 textureCoordinate;',
    'void main() {',
        'gl_FragColor = texture2D(a_texture, textureCoordinate)',
    '}'].join('\n');

    simpleShader.attachVertexShader(vertCode);
    simpleShader.attachFragmentShader(fragCode);
    
    simpleShader.link();
    simpleShader.use(); 


    /* Step 4: Associate the shader programs to buffer objects */
    //Get the attribute location
    var vertices = [
        -1,  1, 0, 
        -1, -1, 0,
         1, -1, 0,
         1,  1, 0,
    ];



    var shaderAttribute = simpleShader.getShaderAttribute("position_model_space");

    var vertexBuffer = new Buffer(gl.ARRAY_BUFFER);
    vertexBuffer.attachBufferVectorData(vertices);

    shaderAttribute.setBuffer(vertexBuffer);
    shaderAttribute.setType(gl.FLOAT);
    shaderAttribute.setSize(3);
    shaderAttribute.enableVertexAttributeArray();
    shaderAttribute.applyConfiguration();

    var textureAttribute = simpleShader.getShaderAttribute("a_texture");
    

    // var elements = [0, 1, 2];//, 0, 2, 3];
    // var elementBuffer = new Buffer(gl.ELEMENT_ARRAY_BUFFER);
    // elementBuffer.attachBufferVectorData(elements);
    // elementBuffer.bind();
    // /* Step5: Drawing the required object (triangle) */

    // Clear the canvas
    gl.clearColor(1, 1, 1, 0);

    // Enable the depth test
    gl.enable(gl.DEPTH_TEST);
    
    // Clear the color buffer bit
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Set the view port
    gl.viewport(0, 0, webglCanvas.width, webglCanvas.height);

    // Draw the triangle
    //gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);

}