import {BaseComponent, Registry} from "@atlas/entt";

export class Scene {
    private readonly _registry: Registry = new Registry();

    protected get registry(): Registry {
        return this._registry;
    }

    public createEntity() {
        return this.registry.create();
    }

    public onStart() {}
    public onUpdate() {}
    public onFixedUpdate() {}
    public async onRender() {}
}