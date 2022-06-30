import * as dat from "dat.gui";
import { Ant } from "./Ant";
import { PheroTrail } from "./PheroTrail";
import { Point } from "./Point";
import { Simulation } from "./Simulation";
import { InputDriver } from "./UserInput";

export interface AppSettings {
    distancePower: number
    pheromonePower: number
    passivePheromone: number
    minimumPheromone: number
    initialPheromone: number
    pheromoneEvaporationRate: number
    pheromoneIntensity: number
    pheromoneDecay: boolean
    ants: number
    focusedAnt: number
    simSpeed: number
    passiveAscend: boolean
    showPheromone: boolean
    showBestTrail: boolean
    paused: boolean
    turboMode: boolean
    verboseConsole: boolean
    fadeClear: boolean
    startControl: Function
    stopControl: Function
}

export class App {
    public points: Point[] = [];
    public ants: Ant[] = [];
    public bestAnt: Ant | null = null;
    public pheroTrails: PheroTrail[] = [];
    public inputDriver: InputDriver;
    public canvas: HTMLCanvasElement;
    public ui: CanvasRenderingContext2D;
    public gui: dat.GUI;
    public guiObject!: AppSettings;
    public guiControllers: {[key: string]: dat.GUIController} = {};
    public guiFolders: {[key: string]: dat.GUI} = {};
    private _width: number = 0;
    private _height: number = 0;

    constructor(width: number, height: number) {
        this.canvas = document.createElement("canvas");
        this.ui = this.canvas.getContext("2d")!;
        this.inputDriver = new InputDriver(this);
        this.width = width;
        this.height = height;
        this.gui = new dat.GUI({
            autoPlace: true,
            width: 300
        });

        document.body.appendChild(this.canvas);
        
        this.setupDat();
        this.raf();
    }

    public setupDat() {
        const app: App = this;

        this.guiObject = {
            distancePower: 3,
            pheromonePower: 1.3,
            passivePheromone: 1.5,
            passiveAscend: true,
            pheromoneDecay: false,
            minimumPheromone: 0.1,
            pheromoneEvaporationRate: 0.8,
            pheromoneIntensity: 15,
            initialPheromone: 1,
            ants: 500,
            focusedAnt: -2,
            simSpeed: 1,
            showPheromone: true,
            showBestTrail: true,
            paused: false,
            turboMode: false,
            fadeClear: false,
            verboseConsole: false,
            startControl: function() {
                if (Simulation.started) {
                    Simulation.step();
                } else {
                    Simulation.start();
                    app.guiControllers.focusedAnt.updateDisplay();
                }
            },
            stopControl: function() {
                if (Simulation.started) {
                    Simulation.started = false;
                    app.guiControllers.focusedAnt.updateDisplay();
                } else {
                    app.points = app.ants = [];
                }
            }
        }

        this.guiFolders = {
            simulation: this.gui.addFolder("simulation"),
            antAI: this.gui.addFolder("antAI")
        }

        this.guiFolders.simulation.open();
        this.guiFolders.antAI.open();

        this.guiControllers = {
            distancePower: this.guiFolders.antAI.add(this.guiObject, "distancePower", 0.1, 10, 0.1),
            pheromonePower: this.guiFolders.antAI.add(this.guiObject, "pheromonePower", 0.1, 10, 0.1),
            passivePheromone: this.guiFolders.antAI.add(this.guiObject, "passivePheromone", 1, 20, 0.5),
            minimumPheromone: this.guiFolders.antAI.add(this.guiObject, "minimumPheromone", 0.01, 2, 0.01).name("minPheromone"),
            pheromoneEvaporationRate: this.guiFolders.antAI.add(this.guiObject, "pheromoneEvaporationRate", 0.01, 1, 0.01).name("evaporationRate"),
            pheromoneIntensity: this.guiFolders.antAI.add(this.guiObject, "pheromoneIntensity", 1, 20, 1),
            initialPheromone: this.guiFolders.antAI.add(this.guiObject, "initialPheromone", 0.1, 9.9, 0.1),
            pheromoneDecay: this.guiFolders.antAI.add(this.guiObject, "pheromoneDecay").name("pheroDecay?"),
            passiveAscend: this.guiFolders.antAI.add(this.guiObject, "passiveAscend").name("passiveAscend?"),

            ants: this.guiFolders.simulation.add(this.guiObject, "ants", 5, 10000),
            focusedAnt: this.guiFolders.simulation.add(this.guiObject, "focusedAnt", -2, -1, 1),
            simSpeed: this.guiFolders.simulation.add(this.guiObject, "simSpeed", 1, 1000),
            showPheromone: this.guiFolders.simulation.add(this.guiObject, "showPheromone"),
            showBestTrail: this.guiFolders.simulation.add(this.guiObject, "showBestTrail"),
            paused: this.guiFolders.simulation.add(this.guiObject, "paused").name("paused?"),
            verboseConsole: this.guiFolders.simulation.add(this.guiObject, "verboseConsole").name("verbose?"),

            turboMode: this.gui.add(this.guiObject, "turboMode"),
            fadeClear: this.gui.add(this.guiObject, "fadeClear"),
            startControl: this.gui.add(this.guiObject, "startControl").name("<{ Start Simulation }>"),
            stopControl: this.gui.add(this.guiObject, "stopControl").name("<{ Clear Points }>")
        }
    }

    public step() {
        if (Simulation.started) {
            this.guiControllers.startControl.name("<{ Step Simulation }>");
            this.guiControllers.stopControl.name("<{ Stop Simulation }>");
        } else {
            this.guiControllers.startControl.name("<{ Start Simulation }>");
            this.guiControllers.stopControl.name("<{ Clear Simulation }>");
        }
        this.guiControllers.focusedAnt.max(this.ants.length - 1);

        this.ui.beginPath();
        this.ui.fillStyle = "#000000";
        this.ui.fillRect(0, 0, this.width, this.height);
        this.ui.closePath();

        if (this.inputDriver.keyPress == " ") {
            this.points.push(new Point(this, this.inputDriver.mousePos.clone()));
            this.bestAnt = null;
        }

        this.points.forEach(o => o.step());
        this.ants.forEach(o => o.step());
        this.pheroTrails.forEach(o => o.step());
        
        if (this.guiControllers.showBestTrail.getValue()) {
            if (this.bestAnt) {
                this.bestAnt.drawPointWeights(true);
                this.ui.beginPath();
                this.ui.strokeStyle = "white";
                this.ui.font = "30px Arial";
                this.ui.strokeText("Best Distance: " + this.bestAnt.pathTakenDistance, 20, 40);
                this.ui.stroke();
                this.ui.closePath();
            }

            this.ui.beginPath();
            this.ui.strokeStyle = "white";
            this.ui.font = "30px Arial";
            this.ui.strokeText("Simulation Step: " + Simulation.steps, 20, 80);
            this.ui.stroke();
            this.ui.closePath();
        }
    }

    private raf() {
        if (this.guiControllers.fadeClear.getValue()) {
            this.ui.beginPath();
            this.ui.fillRect(0, 0, this.width, this.height);
            this.ui.fillStyle = "#00000011";
            this.ui.fill();
            this.ui.closePath();
        } else {
            this.ui.clearRect(0, 0, this.width, this.height);
        }

        this.inputDriver.step();
        this.step();

        if (this.guiControllers.turboMode.getValue())
            setTimeout(this.raf.bind(this));
        else
            requestAnimationFrame(this.raf.bind(this));
    }

    get width(): number {
        return this._width;
    }

    get height(): number {
        return this._height;
    }

    set width(n: number) {
        this._width = n;
        this.canvas.width = this._width;
    }

    set height(n: number) {
        this._height = n;
        this.canvas.height = this._width;
    }
}