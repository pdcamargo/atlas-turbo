import {mat4, vec2, vec3, vec4} from 'gl-matrix';
import {OrthographicCamera} from './orthographic-camera';
import {Camera} from './camera';
import {EditorCamera} from './editor-camera';
import {Texture2D, TextureSpecification} from './texture';
import {Shader} from './shader';
import {VertexArray} from './vertex-array';
import {RenderCommand} from './render-command';
import {UniformBuffer} from './uniform-buffer';
import {VertexBuffer, IndexBuffer, BufferLayout, ShaderDataType, BufferElement} from './buffer';
import {VertexArrayFactory} from "./vertext-array-library";
import {BufferFactory} from "./buffer-library";
import {TextureFactory} from "./texture-library";
import {ShaderLibrary} from "./shader-library";

// import { SpriteRendererComponent, TextComponent } from './components';

class Renderer2D {
    private static s_Data: Renderer2DData;

    static init(gl: WebGL2RenderingContext) {
        this.s_Data = new Renderer2DData();

        this.s_Data.quadVertexArray = VertexArrayFactory.create(gl);

        this.s_Data.quadVertexBuffer = BufferFactory.createVertexBuffer(gl, this.s_Data.maxVertices * QuadVertex.sizeOf());

        this.s_Data.quadVertexBuffer.setLayout(new BufferLayout([
            new BufferElement(ShaderDataType.Float3, 'a_Position'),
            new BufferElement(ShaderDataType.Float4, 'a_Color'),
            new BufferElement(ShaderDataType.Float2, 'a_TexCoord'),
            new BufferElement(ShaderDataType.Float, 'a_TexIndex'),
            new BufferElement(ShaderDataType.Float, 'a_TilingFactor'),
            new BufferElement(ShaderDataType.Int, 'a_EntityID')
        ]));

        this.s_Data.quadVertexArray.addVertexBuffer(this.s_Data.quadVertexBuffer);
        this.s_Data.quadVertexBufferBase = new Array(this.s_Data.maxVertices);

        const quadIndices: number[] = Array(this.s_Data.maxIndices);
        let offset = 0;
        for (let i = 0; i < this.s_Data.maxIndices; i += 6) {
            quadIndices[i + 0] = offset + 0;
            quadIndices[i + 1] = offset + 1;
            quadIndices[i + 2] = offset + 2;

            quadIndices[i + 3] = offset + 2;
            quadIndices[i + 4] = offset + 3;
            quadIndices[i + 5] = offset + 0;

            offset += 4;
        }

        const quadIB = BufferFactory.createIndexBuffer(gl, new Uint32Array(quadIndices), this.s_Data.maxIndices);
        this.s_Data.quadVertexArray.setIndexBuffer(quadIB);

        // circles
        this.s_Data.circleVertexArray = VertexArrayFactory.create(gl);

        this.s_Data.circleVertexBuffer = BufferFactory.createVertexBuffer(gl, this.s_Data.maxVertices * CircleVertex.sizeOf());

        this.s_Data.circleVertexBuffer.setLayout(new BufferLayout([
            new BufferElement(ShaderDataType.Float3, 'a_WorldPosition'),
            new BufferElement(ShaderDataType.Float2, 'a_LocalPosition'),
            new BufferElement(ShaderDataType.Float4, 'a_Color'),
            new BufferElement(ShaderDataType.Float, 'a_Thickness'),
            new BufferElement(ShaderDataType.Float, 'a_Fade'),
            new BufferElement(ShaderDataType.Int, 'a_EntityID')
        ]));

        this.s_Data.circleVertexArray.addVertexBuffer(this.s_Data.circleVertexBuffer);
        this.s_Data.circleVertexArray.setIndexBuffer(quadIB);
        this.s_Data.circleVertexBufferBase = new Array(this.s_Data.maxVertices);


        // Lines
        this.s_Data.lineVertexArray = VertexArrayFactory.create(gl);

        this.s_Data.lineVertexBuffer = BufferFactory.createVertexBuffer(gl, this.s_Data.maxVertices * TextVertex.sizeOf());

        this.s_Data.lineVertexBuffer.setLayout(new BufferLayout([
            new BufferElement(ShaderDataType.Float3, 'a_Position'),
            new BufferElement(ShaderDataType.Float4, 'a_Color'),
            new BufferElement(ShaderDataType.Float2, 'a_TexCoord'),
            new BufferElement(ShaderDataType.Int, 'a_EntityID')
        ]));

        this.s_Data.lineVertexArray.addVertexBuffer(this.s_Data.lineVertexBuffer);
        this.s_Data.lineVertexArray.setIndexBuffer(quadIB);
        this.s_Data.lineVertexBufferBase = new Array(this.s_Data.maxVertices);

        this.s_Data.whiteTexture = TextureFactory.create(gl, new TextureSpecification());

        const whiteTextureData = new Uint32Array([0xffffffff]);

        this.s_Data.whiteTexture.setData(whiteTextureData, whiteTextureData.byteLength);

        const samplers: Array<number> = new Array(this.s_Data.maxTextureSlots);

        for (let i = 0; i < this.s_Data.maxTextureSlots; i++) {
            samplers[i] = i;
        }

        this.s_Data.quadShader = ShaderLibrary.loadFromPath(gl, 'assets/shaders/quad.glsl');
        this.s_Data.circleShader = ShaderLibrary.loadFromPath(gl, 'assets/shaders/circle.glsl');
        this.s_Data.lineShader = ShaderLibrary.loadFromPath(gl, 'assets/shaders/line.glsl');
        // this.s_Data.textShader = ShaderLibrary.loadFromPath(gl, 'assets/shaders/text.glsl');

        // Set first texture slot to 0
        this.s_Data.textureSlots[0] = this.s_Data.whiteTexture;

        this.s_Data.quadVertexPositions[0] = vec4.fromValues(-0.5, -0.5, 0.0, 1.0);
        this.s_Data.quadVertexPositions[1] = vec4.fromValues(0.5, -0.5, 0.0, 1.0);
        this.s_Data.quadVertexPositions[2] = vec4.fromValues(0.5, 0.5, 0.0, 1.0);
        this.s_Data.quadVertexPositions[3] = vec4.fromValues(-0.5, 0.5, 0.0, 1.0);

        this.s_Data.cameraBuffer = new CameraData();
    }

    static shutdown() {
        // Clean up any allocated resources
        this.s_Data.shutdown();
    }

    static beginScene(camera: Camera, transform: mat4) {
        this.s_Data.cameraBuffer.viewProjection = mat4.multiply(mat4.create(), camera.getProjection(), mat4.invert(mat4.create(), transform));
        this.s_Data.cameraUniformBuffer.setData(this.s_Data.cameraBuffer, 0, UniformBuffer.DYNAMIC_DRAW);

        this.s_Data.startBatch();
    }

    static beginSceneEditor(camera: EditorCamera) {
        this.s_Data.cameraBuffer.viewProjection = camera.getViewProjection();
        this.s_Data.cameraUniformBuffer.setData(this.s_Data.cameraBuffer, 0, UniformBuffer.DYNAMIC_DRAW);

        this.s_Data.startBatch();
    }

    static endScene() {
        this.s_Data.flush();
    }

    static drawQuad(position: vec2 | vec3, size: vec2, color: vec4) {
        if ((position as vec3)[2] === undefined) {
            (position as vec3)[2] = 0;
        }
        const transform = mat4.fromTranslation(mat4.create(), position as vec3);
        mat4.scale(transform, transform, [size[0], size[1], 1.0]);
        this.s_Data.drawQuad(transform, color);
    }

    static drawQuadTexture(position: vec2 | vec3, size: vec2, texture: Texture2D, tilingFactor: number = 1.0, tintColor: vec4 = vec4.fromValues(1.0, 1.0, 1.0, 1.0)) {
        if ((position as vec3)[2] === undefined) {
            (position as vec3)[2] = 0;
        }
        const transform = mat4.fromTranslation(mat4.create(), position as vec3);
        mat4.scale(transform, transform, [size[0], size[1], 1.0]);
        this.s_Data.drawQuadTexture(transform, texture, tilingFactor, tintColor);
    }

    static drawRotatedQuad(position: vec2 | vec3, size: vec2, rotation: number, color: vec4) {
        if ((position as vec3)[2] === undefined) {
            (position as vec3)[2] = 0;
        }
        const transform = mat4.fromTranslation(mat4.create(), position as vec3);
        mat4.rotateZ(transform, transform, rotation);
        mat4.scale(transform, transform, [size[0], size[1], 1.0]);
        this.s_Data.drawQuad(transform, color);
    }

    static drawRotatedQuadTexture(position: vec2 | vec3, size: vec2, rotation: number, texture: Texture2D, tilingFactor: number = 1.0, tintColor: vec4 = vec4.fromValues(1.0, 1.0, 1.0, 1.0)) {
        if ((position as vec3)[2] === undefined) {
            (position as vec3)[2] = 0;
        }
        const transform = mat4.fromTranslation(mat4.create(), position as vec3);
        mat4.rotateZ(transform, transform, rotation);
        mat4.scale(transform, transform, [size[0], size[1], 1.0]);
        this.s_Data.drawQuadTexture(transform, texture, tilingFactor, tintColor);
    }

    static drawSprite(transform: mat4, src: SpriteRendererComponent, entityID: number) {
        if (src.texture) {
            this.s_Data.drawQuadTexture(transform, src.texture, src.tilingFactor, src.color, entityID);
        } else {
            this.s_Data.drawQuad(transform, src.color, entityID);
        }
    }

    // static drawString(string: string, font: Font, transform: mat4, textParams: TextParams, entityID: number) {
    //     this.s_Data.drawString(string, font, transform, textParams, entityID);
    // }

    static getLineWidth(): number {
        return this.s_Data.lineWidth;
    }

    static setLineWidth(width: number) {
        this.s_Data.lineWidth = width;
    }

    static resetStats() {
        this.s_Data.resetStats();
    }

    static getStats(): Statistics {
        return this.s_Data.stats;
    }
}

class Renderer2DData {
    maxQuads: number = 20000;
    maxVertices: number = this.maxQuads * 4;
    maxIndices: number = this.maxQuads * 6;
    maxTextureSlots: number = 32; // TODO: RenderCaps

    quadVertexArray: VertexArray;
    quadVertexBuffer: VertexBuffer;
    quadShader: Shader;
    whiteTexture: Texture2D;

    circleVertexArray: VertexArray;
    circleVertexBuffer: VertexBuffer;
    circleShader: Shader;

    lineVertexArray: VertexArray;
    lineVertexBuffer: VertexBuffer;
    lineShader: Shader;

    textVertexArray: VertexArray;
    textVertexBuffer: VertexBuffer;
    textShader: Shader;

    quadIndexCount = 0;
    quadVertexBufferBase: QuadVertex[];
    quadVertexBufferPtr: QuadVertex;

    circleIndexCount = 0;
    circleVertexBufferBase: CircleVertex[];
    circleVertexBufferPtr: CircleVertex;

    lineIndexCount = 0;
    lineVertexBufferBase: QuadVertex[];
    lineVertexBufferPtr: QuadVertex;

    textIndexCount = 0;
    textVertexBufferBase: QuadVertex[];
    textVertexBufferPtr: QuadVertex;

    lineWidth = 2.0;

    textureSlots: Texture2D[] = [];
    textureSlotIndex: number = 1; // 0 = white texture

    cameraBuffer: CameraData;
    cameraUniformBuffer: UniformBuffer;

    quadVertexPositions: vec4[] = Array(4);

    stats: Statistics = new Statistics();

    shutdown() {
        // Clean up any allocated resources
    }

    startBatch() {
        // Reset vertex and index count
    }

    flush() {
        // Render all collected data
    }

    drawQuad(transform: mat4, color: vec4, entityID: number = -1) {
        // Add quad vertices to the buffer
    }

    drawQuadTexture(transform: mat4, texture: Texture2D, tilingFactor: number, tintColor: vec4, entityID: number = -1) {
        // Add quad with texture to the buffer
    }

    // drawString(string: string, font: Font, transform: mat4, textParams: TextParams, entityID: number) {
    //     // Add string vertices to the buffer
    // }

    resetStats() {
        this.stats.reset();
    }
}

export class CameraData {
    viewProjection: mat4;

    static sizeOf(): number {
        return 64; // 4x4 matrix of floats (4 bytes each)
    }
}

export class QuadVertex {
    position: vec3;
    color: vec4;
    texCoord: vec2;
    texIndex: number;
    tilingFactor: number;

    // editor only
    entityID: number;

    static sizeOf(): number {
        return 4 * 3 + 4 * 4 + 4 * 2 + 4 + 4 + 4; // Total size in bytes
    }
}

export class LineVertex {
    position: vec3;
    color: vec4;

    // editor only
    entityID: number;

    static sizeOf(): number {
        return 4 * 3 + 4 * 4 + 4; // Total size in bytes
    }
}

export class TextVertex {
    position: vec3;
    color: vec4;
    texCoord: vec2;

    // editor only
    entityID: number;

    static sizeOf(): number {
        return 4 * 3 + 4 * 4 + 4 * 2 + 4; // Total size in bytes
    }
}

export class CircleVertex {
    worldPosition: vec3;
    localPosition: vec2;
    color: vec4;
    thickness: number;
    fade: number;

    // editor only
    entityID: number;

    static sizeOf(): number {
        return 4 * 3 + 4 * 2 + 4 * 4 + 4 + 4 + 4; // Total size in bytes
    }
}

export class Statistics {
    drawCalls: number = 0;
    quadCount: number = 0;

    getTotalVertexCount(): number {
        return this.quadCount * 4;
    }

    getTotalIndexCount(): number {
        return this.quadCount * 6;
    }

    reset() {
        this.drawCalls = 0;
        this.quadCount = 0;
    }
}
