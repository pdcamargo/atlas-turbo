export enum ShaderDataType {
    None = 0,
    Float,
    Float2,
    Float3,
    Float4,
    Mat3,
    Mat4,
    Int,
    Int2,
    Int3,
    Int4,
    Bool
}

export function shaderDataTypeSize(type: ShaderDataType): number {
    switch (type) {
        case ShaderDataType.Float:
            return 4;
        case ShaderDataType.Float2:
            return 4 * 2;
        case ShaderDataType.Float3:
            return 4 * 3;
        case ShaderDataType.Float4:
            return 4 * 4;
        case ShaderDataType.Mat3:
            return 4 * 3 * 3;
        case ShaderDataType.Mat4:
            return 4 * 4 * 4;
        case ShaderDataType.Int:
            return 4;
        case ShaderDataType.Int2:
            return 4 * 2;
        case ShaderDataType.Int3:
            return 4 * 3;
        case ShaderDataType.Int4:
            return 4 * 4;
        case ShaderDataType.Bool:
            return 1;
    }
    console.assert(false, "Unknown ShaderDataType!");
    return 0;
}

export class BufferElement {
    name: string;
    type: ShaderDataType;
    size: number;
    offset: number;
    normalized: boolean;

    constructor(type: ShaderDataType, name: string, normalized: boolean = false) {
        this.name = name;
        this.type = type;
        this.size = shaderDataTypeSize(type);
        this.offset = 0;
        this.normalized = normalized;
    }

    getComponentCount(): number {
        switch (this.type) {
            case ShaderDataType.Float:
                return 1;
            case ShaderDataType.Float2:
                return 2;
            case ShaderDataType.Float3:
                return 3;
            case ShaderDataType.Float4:
                return 4;
            case ShaderDataType.Mat3:
                return 3; // 3* float3
            case ShaderDataType.Mat4:
                return 4; // 4* float4
            case ShaderDataType.Int:
                return 1;
            case ShaderDataType.Int2:
                return 2;
            case ShaderDataType.Int3:
                return 3;
            case ShaderDataType.Int4:
                return 4;
            case ShaderDataType.Bool:
                return 1;
        }
        console.assert(false, "Unknown ShaderDataType!");
        return 0;
    }
}

export class BufferLayout {
    private elements: BufferElement[];
    private stride: number;

    constructor(elements: BufferElement[] = []) {
        this.elements = elements;
        this.stride = 0;
        this.calculateOffsetsAndStride();
    }

    getStride(): number {
        return this.stride;
    }

    getElements(): BufferElement[] {
        return this.elements;
    }

    private calculateOffsetsAndStride(): void {
        let offset = 0;
        this.stride = 0;

        for (let element of this.elements) {
            element.offset = offset;
            offset += element.size;
            this.stride += element.size;
        }
    }
}

export interface VertexBuffer {
    bind(): void;

    unbind(): void;

    setData(data: ArrayBuffer, size: number): void;

    getLayout(): BufferLayout;

    setLayout(layout: BufferLayout): void;
}

export interface IndexBuffer {
    bind(): void;

    unbind(): void;

    getCount(): number;
}

