import {Shader} from "../renderer";

export class WebGLShader implements Shader {
    private gl: WebGL2RenderingContext;
    private program: WebGLProgram;
    private name: string;
    private uniformLocations: Map<string, WebGLUniformLocation>;

    constructor(name: string, vertexSrc: string, fragmentSrc: string, gl: WebGL2RenderingContext) {
        this.name = name;
        this.gl = gl;
        this.uniformLocations = new Map();
        this.program = this.createProgram(vertexSrc, fragmentSrc);
    }

    public static fromPath(gl: WebGL2RenderingContext, path: string): WebGLShader {
        // TODO: figure out path loading
        return new WebGLShader(path, path, path, gl);
    }

    bind(): void {
        this.gl.useProgram(this.program);
    }

    unbind(): void {
        this.gl.useProgram(null);
    }

    setInt(name: string, value: number): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform1i(location, value);
    }

    setIntArray(name: string, values: Int32Array, count: number): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform1iv(location, values);
    }

    setFloat(name: string, value: number): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform1f(location, value);
    }

    setFloat2(name: string, value: [number, number]): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform2f(location, value[0], value[1]);
    }

    setFloat3(name: string, value: [number, number, number]): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform3f(location, value[0], value[1], value[2]);
    }

    setFloat4(name: string, value: [number, number, number, number]): void {
        const location = this.getUniformLocation(name);
        this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
    }

    setMat4(name: string, value: Float32Array): void {
        const location = this.getUniformLocation(name);
        this.gl.uniformMatrix4fv(location, false, value);
    }

    getName(): string {
        return this.name;
    }

    private createProgram(vertexSrc: string, fragmentSrc: string): WebGLProgram {
        const vertexShader = this.compileShader(vertexSrc, this.gl.VERTEX_SHADER);
        const fragmentShader = this.compileShader(fragmentSrc, this.gl.FRAGMENT_SHADER);

        const program = this.gl.createProgram()!;
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            const info = this.gl.getProgramInfoLog(program);
            throw new Error(`Could not link WebGL program: ${info}`);
        }

        this.gl.deleteShader(vertexShader);
        this.gl.deleteShader(fragmentShader);

        return program;
    }

    private compileShader(source: string, type: GLenum) {
        const shader = this.gl.createShader(type)!;
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            const info = this.gl.getShaderInfoLog(shader);
            this.gl.deleteShader(shader);
            throw new Error(`Could not compile WebGL shader: ${info}`);
        }

        return shader;
    }

    private getUniformLocation(name: string): WebGLUniformLocation {
        if (this.uniformLocations.has(name)) {
            return this.uniformLocations.get(name)!;
        }

        const location = this.gl.getUniformLocation(this.program, name);
        if (!location) {
            throw new Error(`Uniform ${name} not found in shader.`);
        }

        this.uniformLocations.set(name, location);
        return location;
    }
}
