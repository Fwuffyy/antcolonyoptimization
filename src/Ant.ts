import { App } from "./App";
import { BaseObject } from "./BaseObject";
import { PheroTrail } from "./PheroTrail";
import { Point } from "./Point";
import { Vector2, WeightMap } from "./util";

export enum AntState {
    IDLE,
    PICKING,
    END
}

export class Ant extends BaseObject {
    public static id: number = 0;
    public initialPoint?: Point;
    public point?: Point;
    public state: AntState = AntState.PICKING;
    public pointWeights: WeightMap = {};
    public pathTaken: number[] = [];

    constructor(app: App, location: Vector2) {
        super(app, Ant.id++, location);
    }

    public step(): void {
        if (this.point) {
            this.location = this.point.location.clone();
        }

        const focusedAnt = this.app.guiControllers.focusedAnt.getValue();

        if (focusedAnt == -1 || focusedAnt == this.id) {
            this.app.ui.beginPath();
            this.app.ui.fillStyle = "#ff0000";
            this.app.ui.arc(this.location.x, this.location.y, 5, 0, Math.PI * 2);
            this.app.ui.fill();
            this.app.ui.closePath();
            
            this.drawPointWeights();
        }
    }

    public calculatePointWeights(): void {
        if (this.pathTaken.length != this.app.points.length) {
            if (this.app.guiControllers.verboseConsole.getValue())
                console.log("Calculating next point for Ant#" + this.id);
            const pointsNotVisited: Point[] = this.app.points.filter(point => !this.pathTaken.includes(point.id));

            for (let i = 0;i < pointsNotVisited.length;i++) {
                const point = pointsNotVisited[i];
                
                if (point!.id == this.point!.id)
                    continue;
                
                const dist = this.location.distanceTo(point.location) / 100;
                const trail = PheroTrail.getTrail(this.app, this.point!, point);
                let desireability = Math.pow(1 / dist, this.app.guiControllers.distancePower.getValue());
                desireability *= Math.pow(trail.value, this.app.guiControllers.pheromonePower.getValue());
    
                this.pointWeights[point.id] = desireability;
            }
            this.state = AntState.IDLE;
        } else {
            if (this.app.guiControllers.verboseConsole.getValue())
                console.log("Ended pathmaking for Ant#" + this.id);
            this.state = AntState.END;
        }
    }

    get pathTakenDistance(): number {
        let previousLocation = this.app.points.find(point => point.id == this.pathTaken[0])!.location;
        let distance = 0;
        
        for (let i = 1;i < this.pathTaken.length;i++) {
            const pointLocation = Point.fromID(this.app, this.pathTaken[i]).location;
            distance += previousLocation.distanceTo(pointLocation);
            previousLocation = pointLocation;
        }

        distance += this.initialPoint!.location.distanceTo(previousLocation);

        return distance;
    }

    public drawPointWeights(best: boolean = false): void {
        if (this.state != AntState.END) {
            for (let i = 0;i < Object.keys(this.pointWeights).length;i++) {
                const point = Point.fromID(this.app, Object.keys(this.pointWeights)[i]);
                const weight = this.pointWeights[point.id];
    
                this.app.ui.save();
                this.app.ui.beginPath();
                this.app.ui.strokeStyle = "white";
                this.app.ui.lineWidth = 2;
                this.app.ui.globalAlpha = weight;
                this.app.ui.moveTo(this.location.x, this.location.y);
                this.app.ui.lineTo(point.location.x, point.location.y);
                this.app.ui.stroke();
                this.app.ui.closePath();
                this.app.ui.restore();
            }
        } else {
            const firstLocation = Point.fromID(this.app, this.pathTaken[0]).location;

            this.app.ui.beginPath();
            this.app.ui.strokeStyle = best ? "red" : "white";
            this.app.ui.lineWidth = 2;
            this.app.ui.moveTo(firstLocation.x, firstLocation.y);
            
            for (let i = 1;i < this.pathTaken.length;i++) {
                const pointLocation = Point.fromID(this.app, this.pathTaken[i]).location;
                this.app.ui.lineTo(pointLocation.x, pointLocation.y);
            }

            this.app.ui.lineTo(firstLocation.x, firstLocation.y);
            this.app.ui.stroke();
            this.app.ui.closePath();
        }
    }
}