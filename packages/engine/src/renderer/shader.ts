export interface Shader {
    bind(): void;

    unbind(): void;

    setInt(name: string, value: number): void;

    setIntArray(name: string, values: Int32Array, count: number): void;

    setFloat(name: string, value: number): void;

    setFloat2(name: string, value: [number, number]): void;

    setFloat3(name: string, value: [number, number, number]): void;

    setFloat4(name: string, value: [number, number, number, number]): void;

    setMat4(name: string, value: Float32Array): void;

    getName(): string;
}

