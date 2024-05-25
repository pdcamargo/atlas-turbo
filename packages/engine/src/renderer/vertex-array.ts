import {IndexBuffer, VertexBuffer} from "./buffer";

export interface VertexArray {
    bind(): void;

    unbind(): void;

    addVertexBuffer(vertexBuffer: VertexBuffer): void;

    setIndexBuffer(indexBuffer: IndexBuffer): void;

    getVertexBuffers(): VertexBuffer[];

    getIndexBuffer(): IndexBuffer | null;
}