import {vec4} from 'gl-matrix';

import {RendererApiFactory} from "./renderer-api-library";
import {VertexArray} from "./vertex-array";
import {RendererAPI} from "./renderer-api";

export class RenderCommand {
    static #rendererAPI: RendererAPI;

    // TODO: figure out
    public static init(gl: WebGL2RenderingContext): void {
        RenderCommand.#rendererAPI = RendererApiFactory.create(gl);
        RenderCommand.#rendererAPI.init();
    }

    public static setViewport(x: number, y: number, width: number, height: number): void {
        RenderCommand.#rendererAPI.setViewport(x, y, width, height);
    }

    public static setClearColor(color: vec4): void {
        RenderCommand.#rendererAPI.setClearColor(
            color as [number, number, number, number]
        );
    }

    public static clear(): void {
        RenderCommand.#rendererAPI.clear();
    }

    public static drawIndexed(vertexArray: VertexArray, indexCount?: number): void {
        RenderCommand.#rendererAPI.drawIndexed(vertexArray, indexCount);
    }

    public static drawLines(vertexArray: VertexArray, vertexCount: number): void {
        RenderCommand.#rendererAPI.drawLines(vertexArray, vertexCount);
    }

    public static setLineWidth(width: number): void {
        RenderCommand.#rendererAPI.setLineWidth(width);
    }
}
