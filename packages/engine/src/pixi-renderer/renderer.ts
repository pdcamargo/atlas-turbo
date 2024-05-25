"use client";

import * as PIXI from "pixi.js";

export class Renderer {
    private static _instance: Renderer;

    #renderer: PIXI.WebGPURenderer;

    public constructor(private readonly canvas: HTMLCanvasElement) {
        Renderer._instance = this;

        const pixiRenderer = new PIXI.WebGPURenderer();

        this.#renderer = pixiRenderer;
    }

    public static get instance(): Renderer {
        if (!Renderer._instance) {
            throw new Error("Renderer instance not found");
        }

        return Renderer._instance;
    }

    public static async init(canvas: HTMLCanvasElement) {
        await this.instance.#renderer.init({
            canvas,
            width: canvas.width,
            height: canvas.height,
            antialias: false,
            clearBeforeRender: false,
        });
    }

    // private threadRender = threaded(async function* (renderer: PIXI.Renderer, target: PIXI.Container<PIXI.ContainerChild>) {
    //     renderer.render(target);
    // });
    //
    // private threadClear = threaded(async function* (renderer: PIXI.Renderer) {
    //     renderer.clear();
    // });

    public static async render(target: PIXI.Container<PIXI.ContainerChild>) {
        this.instance.#renderer.render(target);
    }

    public static async clear() {
        this.instance.#renderer.clear();
    }
}