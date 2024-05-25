import {WebGLTexture2D} from "../webgl-renderer";
import {TextureSpecification} from "./texture";

export class TextureFactory {
    static create(gl: WebGL2RenderingContext, specification: TextureSpecification): WebGLTexture2D;
    static create(gl: WebGL2RenderingContext, path: string): WebGLTexture2D;
    static create(gl: WebGL2RenderingContext, param: TextureSpecification | string): WebGLTexture2D {
        return new WebGLTexture2D(gl, param as TextureSpecification);
    }
}