import {RendererAPI, VertexArray} from "../renderer";

export class WebGLRendererAPI implements RendererAPI {
    private gl: WebGL2RenderingContext;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
    }

    init(): void {
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        this.gl.enable(this.gl.DEPTH_TEST);

        // Enable debugging if available
        const debugInfo = this.gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            console.log('Vendor:', this.gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL));
            console.log('Renderer:', this.gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
        }
    }

    setViewport(x: number, y: number, width: number, height: number): void {
        this.gl.viewport(x, y, width, height);
    }

    setClearColor(color: [number, number, number, number]): void {
        this.gl.clearColor(color[0], color[1], color[2], color[3]);
    }

    clear(): void {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }

    drawIndexed(vertexArray: VertexArray, indexCount?: number): void {
        vertexArray.bind();
        const indexBuffer = vertexArray.getIndexBuffer();
        if (indexBuffer) {
            const count = indexCount ?? indexBuffer.getCount();
            this.gl.drawElements(this.gl.TRIANGLES, count, this.gl.UNSIGNED_INT, 0);
        } else {
            console.warn("Index buffer is null in drawIndexed call.");
        }
    }

    drawLines(vertexArray: VertexArray, vertexCount: number): void {
        vertexArray.bind();
        this.gl.drawArrays(this.gl.LINES, 0, vertexCount);
    }

    setLineWidth(width: number): void {
        this.gl.lineWidth(width);
    }
}
