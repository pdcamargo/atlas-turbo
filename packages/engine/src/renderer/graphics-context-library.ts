import {GraphicsContext} from "./graphics-context";

import {WebGLContext} from "../webgl-renderer";

export class GraphicsContextFactory {
    public static create(canvas: HTMLCanvasElement): GraphicsContext {
        return new WebGLContext(canvas);
    }
}
