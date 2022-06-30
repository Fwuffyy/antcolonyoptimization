import { App } from "./App";
import { BaseObject } from "./BaseObject";
import { Vector2 } from "./util";

export class Point extends BaseObject {
    private static id: number = 0;

    constructor(app: App, location: Vector2) {
        super(app, Point.id++, location);
    }

    public step(): void {
        this.app.ui.beginPath();
        this.app.ui.fillStyle = "#ffffff";
        this.app.ui.arc(this.location.x, this.location.y, 10, 0, Math.PI * 2);
        this.app.ui.fill();
        this.app.ui.closePath();
    }

    public static fromID(app: App, id: number | string): Point {
        return app.points.find(point => String(point.id) === String(id))!;
    }
}