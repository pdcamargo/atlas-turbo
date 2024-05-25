import {mat4, vec2, vec3, quat} from 'gl-matrix';
import {Camera} from './camera';

// TODO: lots to figure out
export class EditorCamera extends Camera {
    private fov: number;
    private aspectRatio: number;
    private nearClip: number;
    private farClip: number;

    private viewMatrix: mat4;
    private position: vec3;
    private focalPoint: vec3;

    private initialMousePosition: vec2;
    private distance: number;
    private pitch: number;
    private yaw: number;

    private viewportWidth: number;
    private viewportHeight: number;

    constructor(fov: number, aspectRatio: number, nearClip: number, farClip: number) {
        const projection = mat4.create();
        mat4.perspective(projection, fov, aspectRatio, nearClip, farClip);
        super(projection);

        this.fov = fov;
        this.aspectRatio = aspectRatio;
        this.nearClip = nearClip;
        this.farClip = farClip;

        this.viewMatrix = mat4.create();
        this.position = vec3.create();
        this.focalPoint = vec3.create();

        this.initialMousePosition = vec2.create();
        this.distance = 10.0;
        this.pitch = 0.0;
        this.yaw = 0.0;

        this.viewportWidth = 1280;
        this.viewportHeight = 720;

        this.updateView();
    }

    onUpdate(ts: number): void {
        // if (Input.isKeyPressed(Key.LeftAlt)) {
        //     const mouse = vec2.fromValues(Input.getMouseX(), Input.getMouseY());
        //     const delta = vec2.sub(vec2.create(), mouse, this.initialMousePosition);
        //     vec2.scale(delta, delta, 0.003);
        //     vec2.copy(this.initialMousePosition, mouse);
        //
        //     if (Input.isMouseButtonPressed(Mouse.ButtonMiddle)) {
        //         this.mousePan(delta);
        //     } else if (Input.isMouseButtonPressed(Mouse.ButtonLeft)) {
        //         this.mouseRotate(delta);
        //     } else if (Input.isMouseButtonPressed(Mouse.ButtonRight)) {
        //         this.mouseZoom(delta[1]);
        //     }
        // }

        this.updateView();
    }

    onEvent(e: Event): void {
        // if (e instanceof MouseScrolledEvent) {
        //     this.onMouseScroll(e);
        // }
    }

    setViewportSize(width: number, height: number): void {
        this.viewportWidth = width;
        this.viewportHeight = height;
        this.updateProjection();
    }

    getViewMatrix(): mat4 {
        return this.viewMatrix;
    }

    getViewProjection(): mat4 {
        const viewProjection = mat4.create();
        mat4.multiply(viewProjection, this.projection, this.viewMatrix);
        return viewProjection;
    }

    private updateProjection(): void {
        this.aspectRatio = this.viewportWidth / this.viewportHeight;
        mat4.perspective(this.projection, this.fov, this.aspectRatio, this.nearClip, this.farClip);
    }

    private updateView(): void {
        this.position = this.calculatePosition();

        const orientation = this.getOrientation();
        const view = mat4.create();
        mat4.translate(view, view, this.position);
        mat4.multiply(view, view, mat4.fromQuat(mat4.create(), orientation));
        mat4.invert(this.viewMatrix, view);
    }

    // private onMouseScroll(e: MouseScrolledEvent): boolean {
    private onMouseScroll(e: any): boolean {
        const delta = e.getYOffset() * 0.1;
        this.mouseZoom(delta);
        this.updateView();
        return false;
    }

    private mousePan(delta: vec2): void {
        const [xSpeed, ySpeed] = this.panSpeed();
        vec3.scaleAndAdd(this.focalPoint, this.focalPoint, this.getRightDirection(), -delta[0] * xSpeed * this.distance);
        vec3.scaleAndAdd(this.focalPoint, this.focalPoint, this.getUpDirection(), delta[1] * ySpeed * this.distance);
    }

    private mouseRotate(delta: vec2): void {
        const yawSign = this.getUpDirection()[1] < 0 ? -1.0 : 1.0;
        this.yaw += yawSign * delta[0] * this.rotationSpeed();
        this.pitch += delta[1] * this.rotationSpeed();
    }

    private mouseZoom(delta: number): void {
        this.distance -= delta * this.zoomSpeed();
        if (this.distance < 1.0) {
            vec3.scaleAndAdd(this.focalPoint, this.focalPoint, this.getForwardDirection(), 1.0);
            this.distance = 1.0;
        }
    }

    private getUpDirection(): vec3 {
        return vec3.transformQuat(vec3.create(), vec3.fromValues(0.0, 1.0, 0.0), this.getOrientation());
    }

    private getRightDirection(): vec3 {
        return vec3.transformQuat(vec3.create(), vec3.fromValues(1.0, 0.0, 0.0), this.getOrientation());
    }

    private getForwardDirection(): vec3 {
        return vec3.transformQuat(vec3.create(), vec3.fromValues(0.0, 0.0, -1.0), this.getOrientation());
    }

    private calculatePosition(): vec3 {
        const position = vec3.create();
        vec3.scaleAndAdd(position, this.focalPoint, this.getForwardDirection(), -this.distance);
        return position;
    }

    private getOrientation(): quat {
        return quat.fromEuler(quat.create(), -this.pitch, -this.yaw, 0.0);
    }

    private panSpeed(): [number, number] {
        const x = Math.min(this.viewportWidth / 1000.0, 2.4);
        const xFactor = 0.0366 * (x * x) - 0.1778 * x + 0.3021;

        const y = Math.min(this.viewportHeight / 1000.0, 2.4);
        const yFactor = 0.0366 * (y * y) - 0.1778 * y + 0.3021;

        return [xFactor, yFactor];
    }

    private rotationSpeed(): number {
        return 0.8;
    }

    private zoomSpeed(): number {
        let distance = this.distance * 0.2;
        distance = Math.max(distance, 0.0);
        let speed = distance * distance;
        speed = Math.min(speed, 100.0);
        return speed;
    }
}
