export class BaseComponent {
}

export type Entity = number;

type ComponentConstructor<T = any> = new (...args: any[]) => T;

export class Registry {
    private _nextId = -1;

    private readonly _entities = new Set<Entity>();

    private readonly _components = new Map<Entity, BaseComponent[]>();

    private readonly _componentIndex = new Map<new () => BaseComponent, Set<Entity>>();

    private get nextId() {
        return ++this._nextId;
    }

    public create(): Entity {
        const id = this.nextId;

        this._entities.add(id);

        return id;
    }

    public destroy(entity: Entity) {
        this._entities.delete(entity);
        this._components.delete(entity);

        for (const componentSet of this._componentIndex.values()) {
            componentSet.delete(entity);
        }
    }

    public isValid(entity: Entity): boolean {
        return this._entities.has(entity);
    }

    // @ts-ignore
    public emplace<T extends BaseComponent, Args extends ConstructorParameters<typeof component>>(
        entityId: Entity,
        component: new (...args: Args) => T,
        ...args: Args
    ) {
        const instance = new component(...args);

        if (!this._components.has(entityId)) {
            this._components.set(entityId, []);
        }

        this._components.get(entityId)!.push(instance);

        const componentType = instance.constructor as new () => BaseComponent;

        if (!this._componentIndex.has(componentType)) {
            this._componentIndex.set(componentType, new Set<Entity>());
        }

        this._componentIndex.get(componentType)!.add(entityId);
    }

    // @ts-ignore
    public replace<T extends BaseComponent, Args extends ConstructorParameters<typeof component>>(
        entityId: Entity,
        component: new (...args: Args) => T,
        ...args: Args
    ) {
        this.removeComponent(entityId, component);
        this.emplace(entityId, component, ...args);
    }

    // @ts-ignore
    public replaceOrEmplace<T extends BaseComponent, Args extends ConstructorParameters<typeof component>>(
        entityId: Entity,
        component: new (...args: Args) => T,
        ...args: Args
    ) {
        if (this.hasComponent(entityId, component)) {
            this.replace(entityId, component, ...args);
        } else {
            this.emplace(entityId, component, ...args);
        }
    }

    public get<T extends ComponentConstructor[]>(entityId: Entity, ...components: T): { [K in keyof T]: InstanceType<T[K]> } {
        const componentInstances: T[] = [];

        for (const component of components) {
            const instance = this._components.get(entityId)!.find(c => c instanceof component) as T;
            componentInstances.push(instance);
        }

        if (componentInstances.length !== components.length) {
            throw new Error("Entity does not have all the requested components");
        }

        return componentInstances as any;
    }

    public anyOf<T extends BaseComponent>(entityId: Entity, ...components: (new (...args: any[]) => T)[]): boolean {
        return components.some(component => this.hasComponent(entityId, component));
    }

    public allOf<T extends BaseComponent>(entityId: Entity, ...components: (new (...args: any[]) => T)[]): boolean {
        return components.every(component => this.hasComponent(entityId, component));
    }

    public noneOf<T extends BaseComponent>(entityId: Entity, ...components: (new (...args: any[]) => T)[]): boolean {
        return components.every(component => !this.hasComponent(entityId, component));
    }

    public hasComponent<T extends BaseComponent>(entityId: Entity, component: new () => T): boolean {
        const components = this._components.get(entityId);

        if (components) {
            return components.some(c => c instanceof component);
        }

        return false;
    }

    public removeComponent<T extends BaseComponent>(entityId: Entity, component: new () => T) {
        const components = this._components.get(entityId);

        if (components) {
            const index = components.findIndex(c => c instanceof component);
            if (index !== -1) {
                components.splice(index, 1);
                const componentType = component as new () => BaseComponent;

                const componentSet = this._componentIndex.get(componentType);

                if (componentSet) {
                    componentSet.delete(entityId);

                    if (componentSet.size === 0) {
                        this._componentIndex.delete(componentType);
                    }
                }
            }
        }
    }

    private getEntitiesWithComponents<T extends BaseComponent>(components: (new (...args: any[]) => T)[]): Set<Entity> {
        if (components.length === 0) {
            return new Set();
        }

        let resultSet: Set<Entity> = new Set();

        for (const component of components) {
            const entitiesWithComponent = this._componentIndex.get(component) || new Set<Entity>();

            if (resultSet.size === 0) {
                resultSet = new Set(entitiesWithComponent);
            } else {
                resultSet = new Set([...resultSet].filter(entityId => entitiesWithComponent.has(entityId)));
            }

            if (resultSet.size === 0) {
                break;
            }
        }

        return resultSet;
    }

    public query<T extends BaseComponent>(...components: (new (...args: any[]) => T)[]): Entity[] {
        if (components.length === 0) {
            return [...this._entities];
        }

        const resultSet = this.getEntitiesWithComponents(components);

        return [...resultSet];
    }

    public view<T extends ComponentConstructor[]>(...components: T): { [K in keyof T]: InstanceType<T[K]> }[] {
        const resultSet = this.getEntitiesWithComponents(components);
        const result: Array<T[]> = [];

        for (const entityId of resultSet) {
            const componentInstances: T[] = [];

            for (const component of components) {
                const instance = this._components.get(entityId)!.find(c => c instanceof component) as T;
                componentInstances.push(instance);
            }

            result.push(componentInstances);
        }

        return result as any;
    }
}
