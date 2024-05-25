import {Scene} from "./scene";
import {profile} from "./debug";
import {Log} from "./core";

export class Application {
    private static _instance: Application;

    public readonly fixedTimeStep: number = 1 / 60;

    #lastTime: number;
    #accumulator: number;
    #isRunning = false;
    #fpsLastTime = 0;
    #fpsFrameCount = 0;

    #elapsedTime = 0;
    #frameCount = 0;
    #fps = 0;

    #hasInitialized = false;

    private currentScene: Scene | null = null;

    constructor() {
        this.#lastTime = 0;
        this.#accumulator = 0;

        Application._instance = this;
    }

    public static get instance(): Application {
        return Application._instance;
    }

    public async init() {
        if (this.#hasInitialized) return;

        Log.init();

        this.#hasInitialized = true;
    }

    public setScene(scene: Scene) {
        this.currentScene = scene;
    }

    private onStart() {
        this.currentScene?.onStart();
    }

    private onUpdate(deltaTime: number) {
        this.currentScene?.onUpdate();
    }

    private onFixedUpdate() {
        this.currentScene?.onFixedUpdate();
    }

    // @profile
    private async onRender() {
        await this.currentScene?.onRender();
    }

    private async update(currentTime: number) {
        if (!this.#isRunning) return;

        const deltaTime = (currentTime - this.#lastTime) / 1000;
        this.#lastTime = currentTime;
        this.#accumulator += deltaTime;
        this.#elapsedTime += deltaTime;
        this.#frameCount++;
        this.#fpsFrameCount++;

        if (currentTime - this.#fpsLastTime >= 1000) {
            this.#fps = this.#fpsFrameCount;
            this.#fpsFrameCount = 0;
            this.#fpsLastTime = currentTime;
        }

        this.onUpdate(deltaTime);

        while (this.#accumulator >= this.fixedTimeStep) {
            this.onFixedUpdate();
            this.#accumulator -= this.fixedTimeStep;
        }

        await this.onRender();

        requestAnimationFrame(this.update.bind(this));
    }

    public start() {
        this.#isRunning = true;
        this.#lastTime = performance.now();
        this.#fpsLastTime = this.#lastTime;

        this.onStart();

        requestAnimationFrame(this.update.bind(this));
    }

    public stop() {
        this.#isRunning = false;
    }

    public get frameCount(): number {
        return this.#frameCount;
    }

    public get elapsedTime(): number {
        return this.#elapsedTime;
    }

    public get fps(): number {
        if (this.#fps === 0) return 60;

        return this.#fps;
    }
}
