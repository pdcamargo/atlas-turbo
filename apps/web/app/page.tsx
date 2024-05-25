"use client"

import {useEffect} from "react";
import {Application, Scene} from "@atlas/engine";
import {BaseComponent} from "@atlas/entt";

export class ExampleComponent1 extends BaseComponent {
    constructor(initialValue: number) {
        super();

        this.value = initialValue;
    }

    public value: number = 0;
}

export class ExampleComponent2 extends BaseComponent {
    public value: string = "";
}

export class ExampleComponent3 extends BaseComponent {
    public value: boolean = false;
}

export class ExampleOddComponent extends BaseComponent {
    public value: number = 0;
}

export class ExampleEvenComponent extends BaseComponent {
    public value: number = 0;
}

export class ExampleScene extends Scene {
    public override onStart() {
        for (let i = 0; i < 50000; i++) {
            const entity = this.createEntity();

            this.registry.emplace(entity, ExampleComponent1, 0);
            this.registry.emplace(entity, ExampleComponent2);
            this.registry.emplace(entity, ExampleComponent3);

            this.registry.emplace(entity, ExampleComponent1, 0);

            if (i % 2 === 0) {
                this.registry.emplace(entity, ExampleOddComponent);
            }

            if (i % 2 === 1) {
                this.registry.emplace(entity, ExampleEvenComponent);
            }
        }
    }

    public override onUpdate() {
        const entities = this.registry.view(ExampleComponent2, ExampleComponent3);

        for (const entity of entities) {

        }

        console.log(app.fps);
    }

    public override onFixedUpdate() {
    }
}

const app = new Application();

app.setScene(new ExampleScene());

export default function Page() {
    useEffect(() => {
    }, []);

    return (
        <main>
            <button onClick={() => {
                app.init();
                app.start();
            }}>Start
            </button>
        </main>
    );
}
