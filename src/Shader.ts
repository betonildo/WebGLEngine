/// <reference path="ShaderPreprocessor.ts" />
/// <reference path="ShaderAttribute.ts" />
/// <reference path="Buffer.ts" />
/// <reference path="WebGLCurrentContext.ts" />

/**
 * @classdesc Handle shader operations on webgl.
 */
class Shader{

    private shaderProgram : WebGLProgram;

    private vertexShaderSource : string;
    private vertexShaderPointer : WebGLShader;
    private fragmentShaderSource : string;
    private fragmentShaderPointer : WebGLShader;
    private geometryShaderSource : string;
    private geometryShaderPointer : WebGLShader;
    private tesselationShaderSource : string;
    private tesselationShaderPointer : WebGLShader;

    private shaderAttributeCache : Object = {}

    public constructor(){
        this.shaderProgram = WebGLCurrentContext.get().createProgram();
    }

    /**
     * @param {string} vertexShaderSource
     * @description Detach a vertex shader if has and attach a new one shader 
     */
    public attachVertexShader(vertexShaderSource : string) {

        this.vertexShaderSource = ShaderPreprocessor.tryToIncludeShaderModules(vertexShaderSource);
        this.vertexShaderPointer = WebGLCurrentContext.get().createShader(WebGLCurrentContext.get().VERTEX_SHADER);
        this.compileAndAttachShader(this.vertexShaderPointer, this.vertexShaderSource);
    }

    /**
     * @description Detach vertex shader
     */
    public detachVertexShader() {
        if (this.vertexShaderPointer != null)
            WebGLCurrentContext.get().detachShader(this.shaderProgram, this.vertexShaderPointer);
    }

    /**
     * @description Delete current vertex shader
     */
    public deleteVertexShader() {
        if (this.vertexShaderPointer != null)
            WebGLCurrentContext.get().deleteShader(this.vertexShaderPointer);
    }

    /**
     * @param {string} fragmentShaderSource
     * @description Detach a fragment shader if has and attach a new one shader
     */
    public attachFragmentShader(fragmentShaderSource : string) {
        this.fragmentShaderSource = ShaderPreprocessor.tryToIncludeShaderModules(fragmentShaderSource);
        this.fragmentShaderPointer = WebGLCurrentContext.get().createShader(WebGLCurrentContext.get().FRAGMENT_SHADER);
        this.compileAndAttachShader(this.fragmentShaderPointer, this.fragmentShaderSource);
    }

    /**
     * @description Detach vertex shader
     */
    public detachFragmentShader() {
        if (this.fragmentShaderPointer != null)
            WebGLCurrentContext.get().detachShader(this.shaderProgram, this.fragmentShaderPointer);
    }

    /**
     * @description Delete current vertex shader
     */
    public deleteFragmentShader() {
        if (this.fragmentShaderPointer != null)
            WebGLCurrentContext.get().deleteShader(this.fragmentShaderPointer);
    }

    /**
     * @description Compile and attach shader program
     */
    private compileAndAttachShader(shaderPointer : WebGLShader, shaderSource : string) {
        WebGLCurrentContext.get().shaderSource(shaderPointer, shaderSource);
        WebGLCurrentContext.get().compileShader(shaderPointer);
        WebGLCurrentContext.get().attachShader(this.shaderProgram, shaderPointer);
    }

    /**
     * @param {string} attributeName
     * @return {number} Attribute pointer location on GPU
     * @description Gets the attribute pointer location on GPU
     */
    public getAttributeLocation(attributeName : string) : number{
        return WebGLCurrentContext.get().getAttribLocation(this.shaderProgram, attributeName);
    }

    /**
     * @param {string} uniformName
     * @return {WebGLUniformLocation} Uniform pointer location on GPU
     * @description Gets the uniform pointer location on GPU
     */
    public getUniformLocation(uniformName : string) : WebGLUniformLocation{
        return WebGLCurrentContext.get().getUniformLocation(this.shaderProgram, uniformName);
    }

    /**
     * @param {string} attributeName
     * @description Creates shader attribute to attach
     */
    public getShaderAttribute(attributeName : string) : ShaderAttribute {
        var shaderAttributePointer = this.getAttributeLocation(attributeName);
        var shaderAttribute = this.shaderAttributeCache[attributeName];
        if (!shaderAttribute){
            shaderAttribute = new ShaderAttribute(shaderAttributePointer);
            this.shaderAttributeCache[attributeName] = shaderAttribute;
        }   

        return shaderAttribute;
    }

    /**
     * @description link shader program
     */
    public link() {
        WebGLCurrentContext.get().linkProgram(this.shaderProgram);
    }

    /**
     * @description Use this shader program to process final image
     */
    public use(){
        WebGLCurrentContext.get().useProgram(this.shaderProgram);
    }
}