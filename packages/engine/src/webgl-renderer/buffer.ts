import {BufferLayout, IndexBuffer, VertexBuffer} from "../renderer";

export class WebGLVertexBuffer implements VertexBuffer {
    private rendererID: WebGLBuffer;
    private layout: BufferLayout;
    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, size: number);
    constructor(gl: WebGLRenderingContext, vertices: Float32Array, size: number);
    constructor(gl: WebGLRenderingContext, arg1: number | Float32Array, arg2?: number) {
        this.gl = gl;
        if (typeof arg1 === 'number') {
            const size = arg1;
            this.rendererID = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.rendererID);
            gl.bufferData(gl.ARRAY_BUFFER, size, gl.DYNAMIC_DRAW);
        } else {
            const vertices = arg1;
            const size = arg2!;
            this.rendererID = gl.createBuffer()!;
            gl.bindBuffer(gl.ARRAY_BUFFER, this.rendererID);
            gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        }
    }

    bind(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rendererID);
    }

    unbind(): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    setData(data: ArrayBuffer, size: number): void {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.rendererID);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, data);
    }

    getLayout(): BufferLayout {
        return this.layout;
    }

    setLayout(layout: BufferLayout): void {
        this.layout = layout;
    }
}

export class WebGLIndexBuffer implements IndexBuffer {
    private rendererID: WebGLBuffer;
    private count: number;
    private gl: WebGLRenderingContext;

    constructor(gl: WebGLRenderingContext, indicesOrVertices: Uint32Array | number, size: number) {
        this.gl = gl;
        this.count = typeof indicesOrVertices === 'number' ? indicesOrVertices : indicesOrVertices.length;
        this.rendererID = gl.createBuffer()!;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.rendererID);

        if (typeof indicesOrVertices === 'number') {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, size, gl.DYNAMIC_DRAW);
        } else {
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indicesOrVertices, gl.STATIC_DRAW);
        }
    }

    bind(): void {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.rendererID);
    }

    unbind(): void {
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    getCount(): number {
        return this.count;
    }
}
