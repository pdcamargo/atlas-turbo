import {WebGLVertexArray} from "../webgl-renderer";

export class VertexArrayFactory {
    public static create(gl: WebGLRenderingContext) {
        return new WebGLVertexArray(gl)
    }
}