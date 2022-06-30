# How to run
> ## Prerequisites
- Node v16 and up (https://nodejs.org)
- Typescript v4 and up (`npm i -g typescript`)
- Webpack (`npm i -g webpack`)
- jQuery (bundled)

> ## Clone & build this repository
```shell
git clone https://github.com/ChezCoder/AntColonyOptimization
cd AntColonyOptimization
npm install
npm run build
```
Open <u>`./dist/index.html`</u> in a web browser.

# About the project
Utilizing Ant Colony Optimization (ACO), this program finds the quickest route in the cities placed.

ACO mimics the foraging behaviour of ants and a little machine learning. Each ant leaves pheromone trails which have an impact on the decisions of the following ants. These trails decay over time so the more commonly used paths have higher pheromone values.

Check [this video](https://www.youtube.com/watch?v=X-iSQQgOd1A) for more information on this topic.