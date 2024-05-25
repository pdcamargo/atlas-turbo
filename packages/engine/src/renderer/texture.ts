export enum ImageFormat {
    None = 0,
    R8,
    RGB8,
    RGBA8,
    RGBA32F
}

export class TextureSpecification {
    width: number = 1;
    height: number = 1;
    format: ImageFormat = ImageFormat.RGBA8;
    generateMips: boolean = true;
}

export interface Texture {
    getSpecification(): TextureSpecification;

    getWidth(): number;

    getHeight(): number;

    getRendererID(): WebGLTexture | null;

    getPath(): string;

    setData(data: ArrayBuffer, size: number): void;

    bind(slot?: number): void;

    isLoaded(): boolean;

    equals(other: Texture): boolean;
}

export abstract class Texture2D implements Texture {
    abstract getSpecification(): TextureSpecification

    abstract getWidth(): number

    abstract getHeight(): number

    abstract getRendererID(): WebGLTexture | null

    abstract getPath(): string

    abstract setData(data: ArrayBuffer, size: number): void

    abstract bind(slot?: number | undefined): void;

    abstract isLoaded(): boolean;

    abstract equals(other: Texture): boolean;

    static create(specification: TextureSpecification): Texture2D {
        throw new Error("Method not implemented.");
    }

    static createFromPath(path: string): Texture2D {
        throw new Error("Method not implemented.");
    }
}