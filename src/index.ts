import { App } from "./App";
import { Point } from "./Point";
import { Simulation } from "./Simulation";
import { Utils, Vector2 } from "./util";

var app: App;

$(function() {
    alert("This program uses Ant Colony Optimization (ACO) to determine the shortest route between the cities placed.\n\nACO utilizes the foraging behaviour of ants and so called Pheromone Trails as the analogy goes.\n\n\nPress [SPACE] to insert new route.\nFocus ant -2 to hide all ants\nFocus ant -1 to show all ants");
    
    app = new App(window.innerWidth, window.innerHeight);
    Simulation.app = app;

    for(let i = 0;i < 20;i++) {
        const p = 100;
        const x = Utils.random(p, app.width - p);
        const y = Utils.random(p, app.height - p);
        app.points.push(new Point(app, new Vector2(x, y)));
    }
});

$(window).on("resize", function() {
    app.width = window.innerWidth;
    app.height = window.innerHeight;
});