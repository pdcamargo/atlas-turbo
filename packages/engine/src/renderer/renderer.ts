import {mat4} from 'gl-matrix';
import {RenderCommand} from "./render-command";
import {OrthographicCamera} from "./orthographic-camera";
import {Shader} from "./shader";
import {VertexArray} from "./vertex-array";

class SceneData {
    viewProjectionMatrix: mat4 = mat4.create();
}

export type RendererParams = {
    canvas?: HTMLCanvasElement;
    width?: number;
    height?: number;
}

export class Renderer {
    static #canvas: HTMLCanvasElement;

    private static sceneData: SceneData = new SceneData();

    public static init({canvas, width, height}: RendererParams = {}): void {
        this.#canvas = canvas ?? document.createElement("canvas");

        this.#canvas.width = width ?? 800;
        this.#canvas.height = height ?? 600;

        RenderCommand.init(this.#canvas.getContext("webgl2")!);
        // Renderer2D.init(); // Uncomment and implement if you have Renderer2D
    }

    static shutdown(): void {
        // Renderer2D.shutdown(); // Uncomment and implement if you have Renderer2D
    }

    static onWindowResize(width: number, height: number): void {
        RenderCommand.setViewport(0, 0, width, height);
    }

    static beginScene(camera: OrthographicCamera): void {
        this.sceneData.viewProjectionMatrix = camera.getViewProjectionMatrix();
    }

    static endScene(): void {
        // No operation in EndScene for now
    }

    static submit(shader: Shader, vertexArray: VertexArray, transform: mat4 = mat4.create()): void {
        shader.bind();
        shader.setMat4('u_ViewProjection', this.sceneData.viewProjectionMatrix as Float32Array);
        shader.setMat4('u_Transform', transform as Float32Array);

        vertexArray.bind();
        RenderCommand.drawIndexed(vertexArray);
    }
}
