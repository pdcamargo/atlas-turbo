import {WebGLIndexBuffer, WebGLVertexBuffer} from "../webgl-renderer";

export class BufferFactory {
    public static createVertexBuffer(gl: WebGLRenderingContext, size: number): WebGLVertexBuffer;
    public static createVertexBuffer(gl: WebGLRenderingContext, vertices: Float32Array, size: number): WebGLVertexBuffer;
    public static createVertexBuffer(gl: WebGLRenderingContext, arg1: number | Float32Array, arg2?: number): WebGLVertexBuffer {
        return new WebGLVertexBuffer(gl, arg1 as Float32Array, arg2 as number);
    }

    public static createIndexBuffer(gl: WebGLRenderingContext, indicesOrVertices: Uint32Array | number, size: number) {
        return new WebGLIndexBuffer(gl, indicesOrVertices, size);
    }
}