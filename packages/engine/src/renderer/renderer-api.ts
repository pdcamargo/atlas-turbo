import {VertexArray} from "./vertex-array";

export interface RendererAPI {
    init(): void;

    setViewport(x: number, y: number, width: number, height: number): void;

    setClearColor(color: [number, number, number, number]): void;

    clear(): void;

    drawIndexed(vertexArray: VertexArray, indexCount?: number): void;

    drawLines(vertexArray: VertexArray, vertexCount: number): void;

    setLineWidth(width: number): void;
}
