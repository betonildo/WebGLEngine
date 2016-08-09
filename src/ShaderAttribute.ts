/// <reference path="Buffer.ts" />
/// <reference path="WebGLCurrentContext.ts" />

class ShaderAttribute {

    private bufferAttached : Buffer;
    private attributePointer : number;
    private size : number;
    private type : number;
    private normalized : boolean = false;
    private stride : number = 0;
    private offset : number = 0;

    constructor(attributePointer : number) {
        this.attributePointer = attributePointer;
    }

    public setSize(attributeSize : number) {
        this.size = attributeSize;
    }

    public setType(attributeType : number) {
        this.type = attributeType;
    }

    public isNormalized() : boolean {
        return this.normalized;
    }

    public setAsNormalized() {
        this.normalized = true;
    }

    public setAsNotNormalized() {
        this.normalized = false;
    }

    public setStride(attributeStride : number) {
        this.stride = attributeStride;
    }

    public setOffset(attributeOffset : number) {
        this.offset = attributeOffset;
    }

    public setBuffer(bufferToAttach : Buffer) {
        if (!bufferToAttach.isArrayBuffer())
            throw new Error("Buffer is not an Array buffer");
        this.bufferAttached = bufferToAttach;
    }

    public applyConfiguration() {
        this.bufferAttached.bind();
        WebGLCurrentContext.get().vertexAttribPointer(
            this.attributePointer, 
            this.size,
            this.type,
            this.normalized, 
            this.stride, 
            this.offset);
    }

    public enableVertexAttributeArray() {
        WebGLCurrentContext.get().enableVertexAttribArray(this.attributePointer);
    }

    public disableVertexAttributeArray(){
        WebGLCurrentContext.get().disableVertexAttribArray(this.attributePointer);
    }
}