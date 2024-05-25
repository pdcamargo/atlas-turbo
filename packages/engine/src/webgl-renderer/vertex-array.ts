import {IndexBuffer, ShaderDataType, VertexArray, VertexBuffer} from "../renderer";

export class WebGLVertexArray implements VertexArray {
    private gl: WebGLRenderingContext | WebGL2RenderingContext;
    private vao: WebGLVertexArrayObjectOES | WebGLVertexArrayObject | null = null;
    private vertexBuffers: VertexBuffer[] = [];
    private indexBuffer: IndexBuffer | null = null;
    private vertexBufferIndex: number = 0;
    private ext: any = null;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        // Check for WebGL2 context or WebGL1 with extensions
        if ('createVertexArray' in gl) {
            this.vao = (gl as WebGL2RenderingContext).createVertexArray();
        } else {
            this.ext = gl.getExtension('OES_vertex_array_object');
            if (this.ext) {
                this.vao = this.ext.createVertexArrayOES();
            } else {
                throw new Error("VertexArray objects are not supported in this context");
            }
        }
    }

    bind(): void {
        if (this.vao) {
            if (this.ext) {
                this.ext.bindVertexArrayOES(this.vao);
            } else {
                (this.gl as WebGL2RenderingContext).bindVertexArray(this.vao);
            }
        }
    }

    unbind(): void {
        if (this.ext) {
            this.ext.bindVertexArrayOES(null);
        } else {
            (this.gl as WebGL2RenderingContext).bindVertexArray(null);
        }
    }

    addVertexBuffer(vertexBuffer: VertexBuffer): void {
        this.bind();
        vertexBuffer.bind();

        const layout = vertexBuffer.getLayout();
        const elements = layout.getElements();
        for (const element of elements) {
            switch (element.type) {
                case ShaderDataType.Float:
                case ShaderDataType.Float2:
                case ShaderDataType.Float3:
                case ShaderDataType.Float4:
                    this.gl.enableVertexAttribArray(this.vertexBufferIndex);
                    this.gl.vertexAttribPointer(
                        this.vertexBufferIndex,
                        element.getComponentCount(),
                        this.shaderDataTypeToWebGLBaseType(element.type),
                        element.normalized,
                        layout.getStride(),
                        element.offset
                    );
                    this.vertexBufferIndex++;
                    break;

                case ShaderDataType.Int:
                case ShaderDataType.Int2:
                case ShaderDataType.Int3:
                case ShaderDataType.Int4:
                case ShaderDataType.Bool:
                    if ('vertexAttribIPointer' in this.gl) {
                        (this.gl as WebGL2RenderingContext).vertexAttribIPointer(
                            this.vertexBufferIndex,
                            element.getComponentCount(),
                            this.shaderDataTypeToWebGLBaseType(element.type),
                            layout.getStride(),
                            element.offset
                        );
                        this.vertexBufferIndex++;
                    } else {
                        console.error("vertexAttribIPointer is not available in this context");
                    }
                    break;

                case ShaderDataType.Mat3:
                case ShaderDataType.Mat4:
                    const count = element.getComponentCount() / element.getComponentCount(); // Adjust this calculation
                    for (let i = 0; i < count; i++) {
                        this.gl.enableVertexAttribArray(this.vertexBufferIndex);
                        this.gl.vertexAttribPointer(
                            this.vertexBufferIndex,
                            count,
                            this.shaderDataTypeToWebGLBaseType(element.type),
                            element.normalized,
                            layout.getStride(),
                            element.offset + 4 * count * i
                        );
                        if ('vertexAttribDivisor' in this.gl) {
                            (this.gl as WebGL2RenderingContext).vertexAttribDivisor(this.vertexBufferIndex, 1);
                        } else {
                            const ext = this.gl.getExtension('ANGLE_instanced_arrays');
                            if (ext) {
                                ext.vertexAttribDivisorANGLE(this.vertexBufferIndex, 1);
                            } else {
                                console.error("vertexAttribDivisor is not available in this context");
                            }
                        }
                        this.vertexBufferIndex++;
                    }
                    break;

                default:
                    console.assert(false, "Unknown ShaderDataType!");
            }
        }

        this.vertexBuffers.push(vertexBuffer);
    }

    setIndexBuffer(indexBuffer: IndexBuffer): void {
        this.bind();
        indexBuffer.bind();
        this.indexBuffer = indexBuffer;
    }

    getVertexBuffers(): VertexBuffer[] {
        return this.vertexBuffers;
    }

    getIndexBuffer(): IndexBuffer | null {
        return this.indexBuffer;
    }

    private shaderDataTypeToWebGLBaseType(type: ShaderDataType): number {
        switch (type) {
            case ShaderDataType.Float:
            case ShaderDataType.Float2:
            case ShaderDataType.Float3:
            case ShaderDataType.Float4:
            case ShaderDataType.Mat3:
            case ShaderDataType.Mat4:
                return this.gl.FLOAT;
            case ShaderDataType.Int:
            case ShaderDataType.Int2:
            case ShaderDataType.Int3:
            case ShaderDataType.Int4:
                return this.gl.INT;
            case ShaderDataType.Bool:
                return this.gl.BOOL;
            default:
                console.assert(false, "Unknown ShaderDataType!");
                return 0;
        }
    }
}
