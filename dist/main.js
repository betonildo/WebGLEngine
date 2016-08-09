var WebGLCurrentContext = (function () {
    function WebGLCurrentContext() {
    }
    WebGLCurrentContext.get = function () {
        return this.currentContext;
    };
    WebGLCurrentContext.set = function (newWebglContext) {
        this.currentContext = newWebglContext;
    };
    return WebGLCurrentContext;
}());
/// <reference path="WebGLCurrentContext.ts" />
/**
 * Buffer
 *
 * @class Represents buffer to be attached to GPU at present webgl context
 */
var Buffer = (function () {
    /**
     * @param {number} bufferType
     * @description Creates a new gpu buffer.
     */
    function Buffer(bufferType) {
        if (bufferType !== WebGLCurrentContext.get().ARRAY_BUFFER && bufferType !== WebGLCurrentContext.get().ELEMENT_ARRAY_BUFFER) {
            throw new Error('Buffer type is not defined.');
        }
        this.bufferType = bufferType;
        this.bufferPointerOnGPU = WebGLCurrentContext.get().createBuffer();
    }
    /**
     * @param {Array<number>} bufferData
     * @param {number} drawType @default WebGLRenderingContext.STATIC_DRAW
     *
     * @description Attach buffer data to GPU on this created buffer.
     */
    Buffer.prototype.attachBufferVectorData = function (bufferData, drawType) {
        if (drawType === void 0) { drawType = WebGLCurrentContext.get().STATIC_DRAW; }
        this.bufferDataSize = bufferData.length;
        // Bind an empty array buffer to it
        WebGLCurrentContext.get().bindBuffer(this.bufferType, this.bufferPointerOnGPU);
        // Pass the vertices data to the buffer
        WebGLCurrentContext.get().bufferData(this.bufferType, new Float32Array(bufferData), drawType);
        // Unbind the buffer
        WebGLCurrentContext.get().bindBuffer(this.bufferType, null);
    };
    /**
     * @description Bind this buffer for GPU usage.
     */
    Buffer.prototype.bind = function () {
        WebGLCurrentContext.get().bindBuffer(this.bufferType, this.bufferPointerOnGPU);
    };
    /**
     * @description Unbind this buffer from GPU.
     */
    Buffer.prototype.unbind = function () {
        WebGLCurrentContext.get().bindBuffer(this.bufferType, null);
    };
    Buffer.prototype.isArrayBuffer = function () {
        return this.bufferType === WebGLCurrentContext.get().ARRAY_BUFFER;
    };
    Buffer.prototype.size = function () {
        return this.bufferDataSize;
    };
    return Buffer;
}());
/**
 * ShaderPreprocessor
 */
var ShaderPreprocessor = (function () {
    function ShaderPreprocessor() {
    }
    /**
     * @param {string} moduleName
     * @description Try to get a module source code. Defaults is empty string ""
     */
    ShaderPreprocessor.getCachedModule = function (moduleName) {
        return moduleName in this.cachedModules ? this.cachedModules[moduleName] : "";
    };
    ShaderPreprocessor.setShaderModuleSource = function (moduleName, moduleSource) {
        this.cachedModules[moduleName] = moduleSource;
    };
    ShaderPreprocessor.tryToIncludeShaderModules = function (shaderSource) {
        var newShaderSource = shaderSource;
        while (this.hasModuleToInclude(newShaderSource))
            newShaderSource = this.includeModuleSource(newShaderSource);
        return newShaderSource;
    };
    ShaderPreprocessor.hasModuleToInclude = function (shaderSource) {
        return shaderSource.search(/#include/g) >= 0;
    };
    ShaderPreprocessor.getModuleNameWithInclude = function (shaderSource) {
        var moduleNameWithIncludeStartIndex = shaderSource.search(/#include/g);
        var moduleNameWithIncludeEndIndex = shaderSource.search(/>.*/g) + 1;
        return shaderSource.substring(moduleNameWithIncludeStartIndex, moduleNameWithIncludeEndIndex);
    };
    ShaderPreprocessor.getModuleName = function (shaderSource) {
        var moduleNameWithInclude = this.getModuleNameWithInclude(shaderSource);
        var moduleNameStartIndex = moduleNameWithInclude.search(/</g) + 1;
        var moduleNameEndIndex = moduleNameWithInclude.search(/>/g);
        return moduleNameWithInclude.substring(moduleNameStartIndex, moduleNameEndIndex);
    };
    ShaderPreprocessor.includeModuleSource = function (shaderSource) {
        var moduleNameWithInclude = this.getModuleNameWithInclude(shaderSource);
        var moduleName = this.getModuleName(shaderSource);
        var moduleSourceString = this.getCachedModule(moduleName);
        return shaderSource.replace(moduleNameWithInclude, moduleSourceString);
    };
    ShaderPreprocessor.cachedModules = {};
    return ShaderPreprocessor;
}());
/// <reference path="Buffer.ts" />
/// <reference path="WebGLCurrentContext.ts" />
var ShaderAttribute = (function () {
    function ShaderAttribute(attributePointer) {
        this.normalized = false;
        this.stride = 0;
        this.offset = 0;
        this.attributePointer = attributePointer;
    }
    ShaderAttribute.prototype.setSize = function (attributeSize) {
        this.size = attributeSize;
    };
    ShaderAttribute.prototype.setType = function (attributeType) {
        this.type = attributeType;
    };
    ShaderAttribute.prototype.isNormalized = function () {
        return this.normalized;
    };
    ShaderAttribute.prototype.setAsNormalized = function () {
        this.normalized = true;
    };
    ShaderAttribute.prototype.setAsNotNormalized = function () {
        this.normalized = false;
    };
    ShaderAttribute.prototype.setStride = function (attributeStride) {
        this.stride = attributeStride;
    };
    ShaderAttribute.prototype.setOffset = function (attributeOffset) {
        this.offset = attributeOffset;
    };
    ShaderAttribute.prototype.setBuffer = function (bufferToAttach) {
        if (!bufferToAttach.isArrayBuffer())
            throw new Error("Buffer is not an Array buffer");
        this.bufferAttached = bufferToAttach;
    };
    ShaderAttribute.prototype.applyConfiguration = function () {
        this.bufferAttached.bind();
        WebGLCurrentContext.get().vertexAttribPointer(this.attributePointer, this.size, this.type, this.normalized, this.stride, this.offset);
    };
    ShaderAttribute.prototype.enableVertexAttributeArray = function () {
        WebGLCurrentContext.get().enableVertexAttribArray(this.attributePointer);
    };
    ShaderAttribute.prototype.disableVertexAttributeArray = function () {
        WebGLCurrentContext.get().disableVertexAttribArray(this.attributePointer);
    };
    return ShaderAttribute;
}());
/// <reference path="ShaderPreprocessor.ts" />
/// <reference path="ShaderAttribute.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="WebGLCurrentContext.ts" />
/**
 * @classdesc Handle shader operations on webgl.
 */
var Shader = (function () {
    function Shader() {
        this.shaderAttributeCache = {};
        this.shaderProgram = WebGLCurrentContext.get().createProgram();
    }
    /**
     * @param {string} vertexShaderSource
     * @description Detach a vertex shader if has and attach a new one shader
     */
    Shader.prototype.attachVertexShader = function (vertexShaderSource) {
        this.vertexShaderSource = ShaderPreprocessor.tryToIncludeShaderModules(vertexShaderSource);
        this.vertexShaderPointer = WebGLCurrentContext.get().createShader(WebGLCurrentContext.get().VERTEX_SHADER);
        this.compileAndAttachShader(this.vertexShaderPointer, this.vertexShaderSource);
    };
    /**
     * @description Detach vertex shader
     */
    Shader.prototype.detachVertexShader = function () {
        if (this.vertexShaderPointer != null)
            WebGLCurrentContext.get().detachShader(this.shaderProgram, this.vertexShaderPointer);
    };
    /**
     * @description Delete current vertex shader
     */
    Shader.prototype.deleteVertexShader = function () {
        if (this.vertexShaderPointer != null)
            WebGLCurrentContext.get().deleteShader(this.vertexShaderPointer);
    };
    /**
     * @param {string} fragmentShaderSource
     * @description Detach a fragment shader if has and attach a new one shader
     */
    Shader.prototype.attachFragmentShader = function (fragmentShaderSource) {
        this.fragmentShaderSource = ShaderPreprocessor.tryToIncludeShaderModules(fragmentShaderSource);
        this.fragmentShaderPointer = WebGLCurrentContext.get().createShader(WebGLCurrentContext.get().FRAGMENT_SHADER);
        this.compileAndAttachShader(this.fragmentShaderPointer, this.fragmentShaderSource);
    };
    /**
     * @description Detach vertex shader
     */
    Shader.prototype.detachFragmentShader = function () {
        if (this.fragmentShaderPointer != null)
            WebGLCurrentContext.get().detachShader(this.shaderProgram, this.fragmentShaderPointer);
    };
    /**
     * @description Delete current vertex shader
     */
    Shader.prototype.deleteFragmentShader = function () {
        if (this.fragmentShaderPointer != null)
            WebGLCurrentContext.get().deleteShader(this.fragmentShaderPointer);
    };
    /**
     * @description Compile and attach shader program
     */
    Shader.prototype.compileAndAttachShader = function (shaderPointer, shaderSource) {
        WebGLCurrentContext.get().shaderSource(shaderPointer, shaderSource);
        WebGLCurrentContext.get().compileShader(shaderPointer);
        WebGLCurrentContext.get().attachShader(this.shaderProgram, shaderPointer);
    };
    /**
     * @param {string} attributeName
     * @return {number} Attribute pointer location on GPU
     * @description Gets the attribute pointer location on GPU
     */
    Shader.prototype.getAttributeLocation = function (attributeName) {
        return WebGLCurrentContext.get().getAttribLocation(this.shaderProgram, attributeName);
    };
    /**
     * @param {string} uniformName
     * @return {WebGLUniformLocation} Uniform pointer location on GPU
     * @description Gets the uniform pointer location on GPU
     */
    Shader.prototype.getUniformLocation = function (uniformName) {
        return WebGLCurrentContext.get().getUniformLocation(this.shaderProgram, uniformName);
    };
    /**
     * @param {string} attributeName
     * @description Creates shader attribute to attach
     */
    Shader.prototype.getShaderAttribute = function (attributeName) {
        var shaderAttributePointer = this.getAttributeLocation(attributeName);
        var shaderAttribute = this.shaderAttributeCache[attributeName];
        if (!shaderAttribute) {
            shaderAttribute = new ShaderAttribute(shaderAttributePointer);
            this.shaderAttributeCache[attributeName] = shaderAttribute;
        }
        return shaderAttribute;
    };
    /**
     * @description link shader program
     */
    Shader.prototype.link = function () {
        WebGLCurrentContext.get().linkProgram(this.shaderProgram);
    };
    /**
     * @description Use this shader program to process final image
     */
    Shader.prototype.use = function () {
        WebGLCurrentContext.get().useProgram(this.shaderProgram);
    };
    return Shader;
}());
/// <reference path="Shader.ts" />
/**
 * Material
 *
 * @classdesc Material configuration of the shader in high level dealing with Matrix, Vectors and Textures.
 */
var Material = (function () {
    function Material(shader) {
        this.shader = shader;
    }
    return Material;
}());
/**
 * Renderer
 *
 * @classdesc Renderer will operate on window
 */
var Renderer = (function () {
    function Renderer() {
    }
    return Renderer;
}());
/**
 * ShaderPostprocessor
 *
 * @classdesc Provide a globalway to deal with properties for all variables
 */
var ShaderPostprocessor = (function () {
    function ShaderPostprocessor() {
    }
    return ShaderPostprocessor;
}());
/// <reference path="Shader.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="ShaderAttribute.ts" />
/// <reference path="WebGLCurrentContext.ts" />
/// <reference path="ShaderPreprocessor.ts" />
function InitGL() {
    ShaderPreprocessor.setShaderModuleSource("mesh", "attribute vec3 position_model_space;");
    ShaderPreprocessor.setShaderModuleSource("frag_basic", "uniform sampler2D a_texture;");
    var webglCanvas = document.createElement("canvas");
    document.body.appendChild(webglCanvas);
    webglCanvas.width = 320;
    webglCanvas.height = 240;
    webglCanvas.style.display = "block";
    var gl = webglCanvas.getContext("webgl");
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
        -1, 1, 0,
        -1, -1, 0,
        1, -1, 0,
        1, 1, 0,
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
