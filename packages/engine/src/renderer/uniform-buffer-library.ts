import {UniformBuffer} from "./uniform-buffer";

import {WebGLUniformBuffer} from "../webgl-renderer";

export class UniformBufferFactory {
    static create(gl: WebGL2RenderingContext, size: number, binding: number): UniformBuffer {
        return new WebGLUniformBuffer(gl, size, binding);
    }
}