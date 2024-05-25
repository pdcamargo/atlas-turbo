import {mat4, vec3} from 'gl-matrix';

export class OrthographicCamera {
    private projectionMatrix: mat4;
    private viewMatrix: mat4;
    private viewProjectionMatrix: mat4;
    private position: vec3 = vec3.create();
    private rotation: number = 0.0;

    constructor(left: number, right: number, bottom: number, top: number) {
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.viewProjectionMatrix = mat4.create();

        this.setProjection(left, right, bottom, top);
        this.recalculateViewMatrix();
    }

    setProjection(left: number, right: number, bottom: number, top: number): void {
        mat4.ortho(this.projectionMatrix, left, right, bottom, top, -1.0, 1.0);
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }

    getPosition(): vec3 {
        return this.position;
    }

    setPosition(position: vec3): void {
        vec3.copy(this.position, position);
        this.recalculateViewMatrix();
    }

    getRotation(): number {
        return this.rotation;
    }

    setRotation(rotation: number): void {
        this.rotation = rotation;
        this.recalculateViewMatrix();
    }

    getProjectionMatrix(): mat4 {
        return this.projectionMatrix;
    }

    getViewMatrix(): mat4 {
        return this.viewMatrix;
    }

    getViewProjectionMatrix(): mat4 {
        return this.viewProjectionMatrix;
    }

    private recalculateViewMatrix(): void {
        const transform = mat4.create();
        mat4.translate(transform, transform, this.position);
        mat4.rotate(transform, transform, this.rotation * (Math.PI / 180), [0, 0, 1]);

        mat4.invert(this.viewMatrix, transform);
        mat4.multiply(this.viewProjectionMatrix, this.projectionMatrix, this.viewMatrix);
    }
}
