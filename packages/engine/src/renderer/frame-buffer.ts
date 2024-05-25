export enum FramebufferTextureFormat {
    None = 0,
    RGBA8,
    RED_INTEGER,
    DEPTH24STENCIL8,
    Depth = DEPTH24STENCIL8
}

export class FramebufferTextureSpecification {
    textureFormat: FramebufferTextureFormat;

    constructor(format: FramebufferTextureFormat = FramebufferTextureFormat.None) {
        this.textureFormat = format;
    }
}

export class FramebufferAttachmentSpecification {
    attachments: FramebufferTextureSpecification[];

    constructor(attachments: FramebufferTextureSpecification[] = []) {
        this.attachments = attachments;
    }
}

export class FramebufferSpecification {
    width: number = 0;
    height: number = 0;
    attachments: FramebufferAttachmentSpecification;
    samples: number = 1;
    swapChainTarget: boolean = false;

    constructor(attachments: FramebufferAttachmentSpecification = new FramebufferAttachmentSpecification()) {
        this.attachments = attachments;
    }
}

export interface Framebuffer {
    bind(): void;

    unbind(): void;

    resize(width: number, height: number): void;

    readPixel(attachmentIndex: number, x: number, y: number): number;

    clearAttachment(attachmentIndex: number, value: number): void;

    getColorAttachmentRendererID(index?: number): number;

    getSpecification(): FramebufferSpecification;
}
