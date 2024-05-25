import {GraphicsContext} from "../renderer";

export class WebGLContext implements GraphicsContext {
    private canvas: HTMLCanvasElement;
    
    private gl: WebGLRenderingContext;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;

        this.gl = canvas.getContext('webgl2') as WebGLRenderingContext;
        if (!this.gl) {
            throw new Error("WebGL 2.0 is not supported by your browser.");
        }
    }

    init(): void {
        ATL_CORE_INFO("WebGL Info:");
        ATL_CORE_INFO("  Vendor:", this.gl.getParameter(this.gl.VENDOR));
        ATL_CORE_INFO("  Renderer:", this.gl.getParameter(this.gl.RENDERER));
        ATL_CORE_INFO("  Version:", this.gl.getParameter(this.gl.VERSION));
    }

    swapBuffers(): void {
        // For WebGL, swapBuffers can be an empty method as the browser handles buffer swapping.
    }
}
