/// <reference path="WebGLCurrentContext.ts" />

/**
 * Buffer
 * 
 * @class Represents buffer to be attached to GPU at present webgl context
 */
class Buffer {

    private bufferType : number;
    private bufferPointerOnGPU : WebGLBuffer;
    private bufferDataSize : number;

    /**
     * @param {number} bufferType
     * @description Creates a new gpu buffer.
     */
    constructor(bufferType : number) {
        if (bufferType !== WebGLCurrentContext.get().ARRAY_BUFFER && bufferType !== WebGLCurrentContext.get().ELEMENT_ARRAY_BUFFER){
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
    public attachBufferVectorData(bufferData : Array<number>, drawType : number = WebGLCurrentContext.get().STATIC_DRAW){

        this.bufferDataSize = bufferData.length;

        // Bind an empty array buffer to it
        WebGLCurrentContext.get().bindBuffer(this.bufferType, this.bufferPointerOnGPU);
        
        // Pass the vertices data to the buffer
        WebGLCurrentContext.get().bufferData(this.bufferType, new Float32Array(bufferData), drawType);

        // Unbind the buffer
        WebGLCurrentContext.get().bindBuffer(this.bufferType, null);
    }

    /**
     * @description Bind this buffer for GPU usage.
     */
    public bind(){
        WebGLCurrentContext.get().bindBuffer(this.bufferType, this.bufferPointerOnGPU);
    }

    /**
     * @description Unbind this buffer from GPU.
     */
    public unbind(){
        WebGLCurrentContext.get().bindBuffer(this.bufferType, null);
    }

    public isArrayBuffer() : boolean {
        return this.bufferType === WebGLCurrentContext.get().ARRAY_BUFFER;
    }

    public size() : number {
        return this.bufferDataSize;
    }
}