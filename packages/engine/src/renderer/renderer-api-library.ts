import {WebGLRendererAPI} from "../webgl-renderer";

export class RendererApiFactory {
    // TODO: figure out
    public static create(gl: WebGL2RenderingContext) {
        return new WebGLRendererAPI(gl);
    }
}