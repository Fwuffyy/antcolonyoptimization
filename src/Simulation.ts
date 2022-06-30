import { Ant, AntState } from "./Ant";
import { App } from "./App";
import { PheroTrail } from "./PheroTrail";
import { Point } from "./Point";
import { Routine, WaitForMillis } from "./Scheduler";
import { LerpUtils, Utils } from "./util";

export enum SimulationState {
    PATHFINDING,
    DONEFINDING,
    IDLE
}

export namespace Simulation {
    export let app: App;
    export let started: boolean;
    export let simulationState = SimulationState.PATHFINDING;
    export let steps: number = 0;

    export function simTicker(_: boolean = false) {
        if (app.guiControllers.verboseConsole.getValue() && _)
            console.log("Beginning simulation ticker");
        
        if (started) {
            console.log("Dry ticking simulation ticker");
            if (!app.guiControllers.paused.getValue())
                step();
            setTimeout(simTicker, app.guiControllers.simSpeed.getValue());
        } else {
            end();
            if (app.guiControllers.verboseConsole.getValue())
                console.log("Ended simulation ticker");
        }
    }
    
    export function start() {
        if (app.guiControllers.verboseConsole.getValue())
            console.log("Started simulation");

        started = true;
        app.ants = [];
        app.bestAnt = null;

        if (app.points.length < 3) {
            started = false;
            return alert("Place at least 3 points");
        }

        if (app.guiControllers.verboseConsole.getValue())
            console.log("Initializing ants");
        for (let i = 0;i < app.guiControllers.ants.getValue();i++) {
            const point = Utils.sample(app.points)[0];
            const ant = new Ant(app, point.location.clone());
            ant.point = point;
            ant.initialPoint = point;
            ant.pathTaken.push(point.id);
            app.ants.push(ant);
        }

        simTicker(true);
    }

    function antPickState(ant: Ant) {
        if (app.guiControllers.verboseConsole.getValue())
            console.log("Calculating point weights");
        ant.pointWeights = {};
        ant.calculatePointWeights();
    }

    function antIdleState(ant: Ant) {
        if (app.guiControllers.verboseConsole.getValue())
            console.log("Idle ant moving to decided point");
        const pointID = Utils.weightedRandom(ant.pointWeights);
        const point = Point.fromID(app, pointID);

        const trail = PheroTrail.getTrail(app, ant.point!, point);
        if (app.guiControllers.passiveAscend.getValue()) {
            trail.value *= 1 + Utils.normalize(app.guiControllers.passivePheromone.getValue(), 20, 1);
        } else {
            trail.value = app.guiControllers.passivePheromone.getValue();
        }

        ant.pointWeights = {};
        
        ant.point = point;
        ant.pathTaken.push(point.id);

        if (app.guiControllers.verboseConsole.getValue())
            console.log("Finished stepping");
        
        if (app.guiControllers.turboMode.getValue())
            antPickState(ant);
        else
            ant.state = AntState.PICKING;
    }

    export async function step() {
        if (app.guiControllers.verboseConsole.getValue())
            console.log("Stepping simulation");
        
        switch (simulationState) {
            case SimulationState.PATHFINDING:
                for (let i = 0;i < app.ants.length;i++) {
                    const ant = app.ants[i];
                    switch(ant.state) {
                        case AntState.PICKING:
                            antPickState(ant);
                            break;
                        case AntState.IDLE:
                            antIdleState(ant);
                            break;
                        case AntState.END:
                            if (app.guiControllers.verboseConsole.getValue())
                                console.log("Ant signals done pathfinding");
                            if (!app.bestAnt || (app.bestAnt.pathTakenDistance > ant.pathTakenDistance))
                                app.bestAnt = ant
                            simulationState = SimulationState.DONEFINDING;
                            break;
                    }
                }
                break;
            case SimulationState.DONEFINDING:
                app.ants = [];
                Ant.id = 0;

                if (app.guiControllers.verboseConsole.getValue())
                    console.log("Evaporating " + app.pheroTrails.length + " pheromone trails");
                for (let i = 0;i < app.pheroTrails.length;i++) {
                    const trail = app.pheroTrails[i];
                    trail.evaporate();
                }

                if (app.bestAnt) {
                    let previousPoint = Point.fromID(app, app.bestAnt.pathTaken[0]);
                    for (let i = 1;i < app.bestAnt!.pathTaken.length;i++) {
                        const currentPoint = Point.fromID(app, app.bestAnt!.pathTaken[i]);
                        const trail = PheroTrail.getTrail(app, previousPoint, currentPoint);
                        trail.value = app.guiControllers.pheromoneIntensity.getValue();
                        previousPoint = currentPoint;
                    }
    
                    const trail = PheroTrail.getTrail(app, Point.fromID(app, app.bestAnt!.pathTaken[0]), previousPoint);
                    trail.value = app.guiControllers.pheromoneIntensity.getValue();
                }

                steps++;
                simulationState = SimulationState.IDLE;
                break;
            case SimulationState.IDLE:
                if (app.guiControllers.verboseConsole.getValue())
                    console.log("Initializing new ants");
                for (let i = 0;i < app.guiControllers.ants.getValue();i++) {
                    const point = Utils.sample(app.points)[0];
                    const ant = new Ant(app, point.location.clone());
                    ant.point = point;
                    ant.initialPoint = point;
                    ant.pathTaken.push(point.id);
                    app.ants.push(ant);
                }
                simulationState = SimulationState.PATHFINDING;
                break;
        }
    }

    export function end() {
        app.ants = [];
        app.pheroTrails = [];
        app.bestAnt = null;
        Ant.id = 0;
        steps = 0;
    }
}