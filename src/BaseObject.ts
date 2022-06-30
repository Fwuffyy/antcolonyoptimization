import { App } from "./App";
import { Vector2 } from "./util";

export abstract class BaseObject {
    public app: App;
    public location: Vector2;
    public readonly id: number;

    constructor(app: App, id: number, location: Vector2) {
        this.app = app;
        this.location = location;
        this.id = id;
    }

    public step(): void {}
}