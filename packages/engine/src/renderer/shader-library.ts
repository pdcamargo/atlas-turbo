import {Shader} from "./shader";
import {WebGLShader} from "../webgl-renderer";

export class ShaderLibrary {
    private static shaders: Map<string, Shader> = new Map();

    static add(name: string, shader: Shader): void {
        if (this.exists(name)) {
            throw new Error(`Shader with name ${name} already exists!`);
        }
        this.shaders.set(name, shader);
    }

    static addShader(shader: Shader): void {
        this.add(shader.getName(), shader);
    }

    static load(gl: WebGL2RenderingContext, name: string, vertexSrc: string, fragmentSrc: string): Shader {
        const shader = new WebGLShader(name, vertexSrc, fragmentSrc, gl);

        this.add(name, shader);

        return shader;
    }

    static loadFromPath(gl: WebGL2RenderingContext, path: string): Shader {
        const shader = WebGLShader.fromPath(gl, path);

        this.add(shader.getName(), shader);

        return shader;
    }

    static get(name: string): Shader {
        if (!this.exists(name)) {
            throw new Error(`Shader with name ${name} not found!`);
        }
        return this.shaders.get(name)!;
    }

    static exists(name: string): boolean {
        return this.shaders.has(name);
    }
}
