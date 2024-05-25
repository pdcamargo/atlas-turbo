import {UniformBuffer} from "../renderer";

export class WebGLUniformBuffer implements UniformBuffer {
    private gl: WebGL2RenderingContext;
    private rendererID: WebGLBuffer;

    constructor(gl: WebGL2RenderingContext, size: number, binding: number) {
        this.gl = gl;
        this.rendererID = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.rendererID);
        this.gl.bufferData(this.gl.UNIFORM_BUFFER, size, this.gl.DYNAMIC_DRAW);
        this.gl.bindBufferBase(this.gl.UNIFORM_BUFFER, binding, this.rendererID);
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
    }

    setData(data: ArrayBuffer, size: number, offset: number = 0): void {
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, this.rendererID);
        const dataView = new Uint8Array(data);
        this.gl.bufferSubData(this.gl.UNIFORM_BUFFER, offset, dataView, 0, size);
        this.gl.bindBuffer(this.gl.UNIFORM_BUFFER, null);
    }

    delete(): void {
        this.gl.deleteBuffer(this.rendererID);
    }
}
