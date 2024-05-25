import {Framebuffer, FramebufferSpecification, FramebufferTextureFormat} from "../renderer";

export class WebGLFramebuffer implements Framebuffer {
    private rendererID: WebGLFramebuffer;
    private specification: FramebufferSpecification;
    private colorAttachments: WebGLTexture[] = [];
    private depthAttachment: WebGLTexture | null = null;
    private gl: WebGL2RenderingContext;

    private static readonly MAX_FRAMEBUFFER_SIZE = 8192;

    constructor(spec: FramebufferSpecification) {
        this.specification = spec;
        this.gl = this.getWebGLContext();
        this.invalidate();
    }

    private getWebGLContext(): WebGL2RenderingContext {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl2') as WebGL2RenderingContext;
        if (!gl) {
            throw new Error("WebGL 2.0 is not supported by your browser.");
        }
        return gl;
    }

    private invalidate(): void {
        if (this.rendererID) {
            this.gl.deleteFramebuffer(this.rendererID);
            this.colorAttachments.forEach(attachment => this.gl.deleteTexture(attachment));
            if (this.depthAttachment) {
                this.gl.deleteTexture(this.depthAttachment);
            }
        }

        this.rendererID = this.gl.createFramebuffer() as WebGLFramebuffer;

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rendererID);

        // Attachments
        this.specification.attachments.attachments.forEach((spec, index) => {
            const texture = this.gl.createTexture() as WebGLTexture;
            this.colorAttachments.push(texture);
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

            switch (spec.textureFormat) {
                case FramebufferTextureFormat.RGBA8:
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA8, this.specification.width, this.specification.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, null);
                    break;
                case FramebufferTextureFormat.RED_INTEGER:
                    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.R32I, this.specification.width, this.specification.height, 0, this.gl.RED_INTEGER, this.gl.INT, null);
                    break;
            }

            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0 + index, this.gl.TEXTURE_2D, texture, 0);
        });

        if (this.specification.attachments.attachments.some(spec => spec.textureFormat === FramebufferTextureFormat.DEPTH24STENCIL8)) {
            this.depthAttachment = this.gl.createTexture() as WebGLTexture;
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.depthAttachment);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.DEPTH24_STENCIL8, this.specification.width, this.specification.height, 0, this.gl.DEPTH_STENCIL, this.gl.UNSIGNED_INT_24_8, null);
            this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.TEXTURE_2D, this.depthAttachment, 0);
        }

        const framebufferStatus = this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER);
        console.assert(framebufferStatus === this.gl.FRAMEBUFFER_COMPLETE, "Framebuffer is incomplete!");

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    bind(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rendererID);
        this.gl.viewport(0, 0, this.specification.width, this.specification.height);
    }

    unbind(): void {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    resize(width: number, height: number): void {
        if (width === 0 || height === 0 || width > WebGLFramebuffer.MAX_FRAMEBUFFER_SIZE || height > WebGLFramebuffer.MAX_FRAMEBUFFER_SIZE) {
            console.warn(`Attempted to resize framebuffer to ${width}, ${height}`);
            return;
        }
        this.specification.width = width;
        this.specification.height = height;
        this.invalidate();
    }

    readPixel(attachmentIndex: number, x: number, y: number): number {
        console.assert(attachmentIndex < this.colorAttachments.length);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.rendererID);
        const pixelData = new Int32Array(1);
        this.gl.readPixels(x, y, 1, 1, this.gl.RED_INTEGER, this.gl.INT, pixelData);

        return pixelData[0] ?? 0;
    }

    clearAttachment(attachmentIndex: number, value: number): void {
        console.assert(attachmentIndex < this.colorAttachments.length);

        const attachment = this.specification.attachments.attachments[attachmentIndex];

        if (!attachment) {
            throw new Error(`Attachment at index ${attachmentIndex} is undefined`);
        }

        this.gl.clearBufferiv(this.gl.COLOR, attachmentIndex, new Int32Array([value]));
    }

    getColorAttachmentRendererID(index: number = 0): number {
        console.assert(index < this.colorAttachments.length, "Index out of bounds");

        // Returning the texture ID as a number
        const texture = this.colorAttachments[index];
        return texture ? this.gl.getParameter(this.gl.TEXTURE_BINDING_2D) as number : 0;
    }

    getSpecification(): FramebufferSpecification {
        return this.specification;
    }
}
