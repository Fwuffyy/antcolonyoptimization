import { App } from "./App";
import { BaseObject } from "./BaseObject";
import { Point } from "./Point";
import { Utils, Vector2 } from "./util";

export class PheroTrail extends BaseObject {
    private static id: number = 0;
    public app: App;
    public point1: Point;
    public point2: Point;
    public value: number;

    constructor(app: App, point1: Point, point2: Point) {
        super(app, PheroTrail.id++, new Vector2(0, 0));
        this.app = app;
        this.point1 = point1;
        this.point2 = point2;
        this.value = app.guiControllers.initialPheromone.getValue()
    }

    public step() {
        if (this.app.guiControllers.showPheromone.getValue()) {
            const alpha = Utils.normalize(this.value, 20, this.app.guiControllers.minimumPheromone.getValue());
            this.app.ui.save();
            this.app.ui.beginPath();
            this.app.ui.globalAlpha = alpha;
            this.app.ui.lineWidth = 5;
            this.app.ui.strokeStyle = "#0000aa";
            this.app.ui.moveTo(this.point1.location.x, this.point1.location.y);
            this.app.ui.lineTo(this.point2.location.x, this.point2.location.y);
            this.app.ui.stroke();
            this.app.ui.closePath();
            this.app.ui.restore();
        }
    }

    public evaporate() {
        if (this.app.guiControllers.pheromoneDecay.getValue()) {
            this.value *= 1 - this.app.guiControllers.pheromoneEvaporationRate.getValue();
            this.value = Utils.clamp(this.value, this.app.guiControllers.minimumPheromone.getValue(), 20);
        } else {
            if (Math.random() < this.app.guiControllers.pheromoneEvaporationRate.getValue()) {
                this.value = this.app.guiControllers.initialPheromone.getValue();
            }
        }
    }

    public static getTrail(app: App, point1: Point, point2: Point): PheroTrail {
        let trail = app.pheroTrails.find(trail => trail.point1.id == point1.id && trail.point2.id == point2.id)
            || app.pheroTrails.find(trail => trail.point1.id == point2.id && trail.point2.id == point1.id);
        
        if (trail)
            return trail;
        
        trail = new PheroTrail(app, point1, point2);
        app.pheroTrails.push(trail);
        return trail;
    }

    get distance(): number {
        return this.point1.location.distanceTo(this.point2.location);
    }
}