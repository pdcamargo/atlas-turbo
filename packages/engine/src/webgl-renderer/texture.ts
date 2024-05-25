import {ImageFormat, Texture2D, TextureSpecification} from "../renderer";

export class WebGLTexture2D implements Texture2D {
    private gl: WebGL2RenderingContext;
    private specification: TextureSpecification;
    private width: number;
    private height: number;
    private rendererID: WebGLTexture | null;
    private path: string;
    #isLoaded: boolean;
    private internalFormat: number;
    private dataFormat: number;

    constructor(gl: WebGL2RenderingContext, specification: TextureSpecification);
    constructor(gl: WebGL2RenderingContext, path: string);
    constructor(gl: WebGL2RenderingContext, param: TextureSpecification | string) {

        this.gl = gl;
        if (typeof param === 'string') {
            this.path = param;
            this.#isLoaded = false;
            this.rendererID = null;
            this.loadFromFile(param);
        } else {
            this.specification = param;
            this.width = param.width;
            this.height = param.height;
            this.#isLoaded = false;
            this.internalFormat = this.getInternalFormat(param.format);
            this.dataFormat = this.getDataFormat(param.format);
            this.createTexture();
        }
    }

    private loadFromFile(path: string): void {
        // Load the image using an image loading library or plain HTML5 <img> element
        const image = new Image();
        image.src = path;

        image.onload = () => {
            this.width = image.width;
            this.height = image.height;
            this.internalFormat = this.gl.RGBA8;
            this.dataFormat = this.gl.RGBA;
            this.createTextureFromImage(image);
            this.#isLoaded = true;
        };
    }

    private createTexture(): void {
        this.rendererID = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rendererID);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0,
            this.dataFormat, this.gl.UNSIGNED_BYTE, null
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    private createTextureFromImage(image: HTMLImageElement): void {
        this.rendererID = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rendererID);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D, 0, this.internalFormat, this.dataFormat, this.gl.UNSIGNED_BYTE, image
        );

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT);

        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    private getInternalFormat(format: ImageFormat): number {
        switch (format) {
            case ImageFormat.R8:
                return this.gl.R8;
            case ImageFormat.RGB8:
                return this.gl.RGB8;
            case ImageFormat.RGBA8:
                return this.gl.RGBA8;
            case ImageFormat.RGBA32F:
                return this.gl.RGBA32F;
            default:
                return this.gl.RGBA8;
        }
    }

    private getDataFormat(format: ImageFormat): number {
        switch (format) {
            case ImageFormat.R8:
                return this.gl.RED;
            case ImageFormat.RGB8:
                return this.gl.RGB;
            case ImageFormat.RGBA8:
                return this.gl.RGBA;
            case ImageFormat.RGBA32F:
                return this.gl.RGBA;
            default:
                return this.gl.RGBA;
        }
    }

    isLoaded(): boolean {
        return this.#isLoaded;
    }

    getSpecification(): TextureSpecification {
        return this.specification;
    }

    getWidth(): number {
        return this.width;
    }

    getHeight(): number {
        return this.height;
    }

    getRendererID(): WebGLTexture | null {
        return this.rendererID;
    }

    getPath(): string {
        return this.path;
    }

    setData(data: ArrayBuffer, size: number): void {
        if (!this.rendererID) {
            throw new Error('Texture is not initialized');
        }

        const bpp = this.dataFormat === this.gl.RGBA ? 4 : 3;

        if (size !== this.width * this.height * bpp) {
            throw new Error('Data size does not match texture size');
        }

        const typedData = new Uint8Array(data);

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rendererID);
        this.gl.texSubImage2D(
            this.gl.TEXTURE_2D,
            0,
            0,
            0,
            this.width,
            this.height,
            this.dataFormat,
            this.gl.UNSIGNED_BYTE,
            typedData
        );
    }


    bind(slot: number = 0): void {
        if (!this.rendererID) {
            throw new Error('Texture is not initialized');
        }
        this.gl.activeTexture(this.gl.TEXTURE0 + slot);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.rendererID);
    }

    equals(other: Texture2D): boolean {
        return this.rendererID === other.getRendererID();
    }

    create(specification: TextureSpecification): WebGLTexture2D {
        return new WebGLTexture2D(this.gl, specification);
    }

    createFromPath(path: string): WebGLTexture2D {
        return new WebGLTexture2D(this.gl, path);
    }
}
