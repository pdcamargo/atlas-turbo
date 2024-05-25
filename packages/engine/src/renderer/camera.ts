import { mat4 } from 'gl-matrix';

export class Camera {
    protected projection: mat4;

    constructor(projection: mat4 = mat4.create()) {
        this.projection = projection;
    }

    getProjection(): mat4 {
        return this.projection;
    }
}
