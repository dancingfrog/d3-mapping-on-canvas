// https://observablehq.com/@dancingfrog/d3-equal-earth
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 Equal Earth

Ref: [The Equal Earth map projection](https://www.researchgate.net/publication/326879978_The_Equal_Earth_map_projection) by Šavrič *et al.* [View source.](https://github.com/d3/d3-geo/blob/master/src/projection/equalEarth.js)`
)});
  main.variable(observer("map")).define("map", ["DOM","screen","d3","projection","graticule","land","sphere"], function(DOM,screen,d3,projection,graticule,land,sphere)
{
  const context = DOM.context2d(screen.width, screen.height);
  const path = d3.geoPath(projection, context);
  context.beginPath(), path(graticule), context.strokeStyle = "#ccc", context.stroke();
  context.beginPath(), path(land), context.fill();
  context.beginPath(), path(sphere), context.strokeStyle = "#000", context.stroke();
  return context.canvas;
}
);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3-geo@1")
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("projection")).define("projection", ["d3","screen","sphere"], function(d3,screen,sphere){return(
d3.geoEqualEarth()
    .translate([screen.width / 2, screen.height / 2])
    .fitExtent([[1, 1], [screen.width - 1, screen.height - 1]], sphere)
    .rotate([-10, 0])
    .precision(0.1)
)});
  main.variable(observer("screen")).define("screen", ["width"], function(width){return(
{ width: width, height: 500 }
)});
  main.variable(observer("sphere")).define("sphere", function(){return(
{type: "Sphere"}
)});
  main.variable(observer("graticule")).define("graticule", ["d3"], function(d3){return(
d3.geoGraticule10()
)});
  main.variable(observer("land")).define("land", ["topojson","world"], function(topojson,world){return(
topojson.feature(world, world.objects.land)
)});
  main.variable(observer("world")).define("world", function(){return(
fetch("https://unpkg.com/world-atlas@1/world/50m.json").then(response => response.json())
)});
  return main;
}
