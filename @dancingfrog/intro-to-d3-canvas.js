// https://observablehq.com/@dancingfrog/intro-to-d3-canvas@1346
import define1 from "../@dancingfrog/d3-equal-earth.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Intro to D3 Canvas`
)});
  main.variable(observer("canvas")).define("canvas", function(){return(
{ width: 512, height: 256 }
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require('d3')
)});
  const child1 = runtime.module(define1).derive([{name: "canvas", alias: "screen"}], main);
  main.import("map", child1);
  main.variable(observer()).define(["map"], function(map){return(
map
)});
  main.variable(observer()).define(["md"], function(md){return(
md`The map shown above is a demonstration of using D3 to render a map within a 2d canvas context. The code used to do so is:
<pre>
    map = {
      const context = DOM.context2d(screen.width, screen.height);
      const path = d3.geoPath(projection, context);
      context.beginPath(), path(graticule), context.strokeStyle = "#ccc", context.stroke();
      context.beginPath(), path(land), context.fill();
      context.beginPath(), path(sphere), context.strokeStyle = "#000", context.stroke();
      return context.canvas;
    }

</pre>

`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### CanvasRenderingContext2d`
)});
  main.variable(observer()).define(["md"], function(md){return(
md` Here's how we get a [2D rendering context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) for canvas in Observable:`
)});
  main.variable(observer("context")).define("context", ["DOM","canvas"], function(DOM,canvas)
{ 
  return DOM.canvas(canvas.width, canvas.height).getContext('2d');
}
);
  main.variable(observer()).define(["md"], function(md){return(
md` The following blocks demostrate using the canvas context to render animation, with and without D3. In the first animation the data is not bound to the DOM, where as the second animation binds data to elements within a pre-existing SVG model (below). Data can also be bound to "offscreen" DOM elements, ultimately improving performance while allowing D3 to affect state changes in the DOM tree which are subsequently rendered to canvas.
`
)});
  main.variable(observer("drawBackground")).define("drawBackground", ["context"], function(context){return(
function drawBackground (startX = 0, startY = 0) {
    /* Drawing the background */
    /* ====================== */
    context.save();

    // The house
    context.fillStyle = 'royalblue';
    context.fillRect(startX + 50, startY + 150, 200, 100);
    // The door
    context.fillStyle = 'rgba(255, 255, 255, 0.9)';
    context.fillRect(startX + 60, startY + 180, 40, 60);
    // The window
    context.save();
    context.translate(startX, startY + 190);
    context.fillRect(startX, startY, 60, 30);
    context.restore();
    // The roof
    context.beginPath();
    context.moveTo(startX + 50, startY + 150);
    context.lineTo(startX + 250, startY + 150);
    context.lineTo(startX + 50 + 200/2, startY + 100);
    context.closePath();
    context.fillStyle = '#A52A2A';
    context.fill();
    // The tree
    context.beginPath();
    context.lineWidth = 10;
    context.strokeStyle = 'brown';
    context.moveTo(startX + 300, startY + 250);
    context.lineTo(startX + 300, startY + 125);
    context.stroke();
    context.beginPath();
    context.fillStyle = 'green';
    context.arc(startX + 300, startY + 150, 25, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
)});
  main.variable(observer("rain")).define("rain", ["canvas","d3"], function(canvas,d3)
{
  /* Letting it rain */
  /* =============== */
  return {
    items: [],
    maxDrops: 200,
    getDrop: function (index) {
      var obj = {};
      obj.id = index;
      obj.xStart = Math.random() * (canvas.width/2 * 0.9) + (canvas.width/2 * 0.05);
      obj.yStart = Math.floor(Math.random() * -canvas.height);
      obj.x = obj.xStart;
      obj.y = obj.yStart;
      obj.xCloud = 2 * obj.x;
      obj.yCloud = Math.random() * 55 + 10;
      obj.xPuddle = 2 * obj.x;
      obj.yPuddle = canvas.height - Math.random() * 20;
      obj.radiusCloud = 1;
      obj.radiusPuddle = 2;
      obj.radiusGrass = 8;
      obj.speed = Math.round(Math.random() * 2) + 5;

      return obj;
    },
    createDrops: function () {
      this.items = [];
      d3.range(this.maxDrops).forEach(d => {
        this.items.push(
          this.updateDrop(
            this.getDrop(d) // create a drop
          ) // update drops' position
        ); // add to drop array
      });
      return this.items;
    },
    updateDrop: function(drop) {
      drop.x = drop.x === null ? drop.xStart : drop.x;
      drop.y = drop.y === null ? drop.yStart : drop.y + drop.speed;
      drop.y = drop.y > canvas.height ? drop.yStart : drop.y;
      return drop;
    }
  } // rain
}
);
  main.variable(observer()).define(["context"], function(context){return(
context.canvas
)});
  main.variable(observer("learning_d3_mapping_8_3")).define("learning_d3_mapping_8_3", ["context","rain","canvas","drawBackground","Promises"], async function*(context,rain,canvas,drawBackground,Promises)
{
  /**
   * Learning D3.js 4 Mapping by larsvers
   * Example of animating without d3 data control
   * From: https://github.com/larsvers/Learning-D3.js-4-Mapping/blob/master/chapter-8/08_03.html
   */
  let clicked = false;
  
  context.canvas.addEventListener('click', d => clicked = true);
  
  /* Helper functions */ 
  /* ================ */ 
  function circle(ctx, x, y, r, color) {
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  } // circle()
  
  function update() {
    if (!rain.items.length) { 
      // initialisation
      rain.createDrops();
    } else { 
      // from 2nd update forward
      rain.items.forEach(function(el) {
        rain.updateDrop(el); // update drops' position
      });
    } // initialisation vs repeat update conditional
  } // update()
  
  function animate() {
    context.save();
    context.fillStyle = "transparent";
    context.strokeStyle = "transparent";
    context.rect(0, 0, canvas.width/2, canvas.height);
    context.clip();
    context.clearRect(0, 0, canvas.width/2, canvas.height);
    drawBackground(canvas.width/4, -10);
    
    rain.items.forEach(function(el) {
      circle(context, el.x, el.y, 1.5, 'blue');
    });
    context.restore();
  } // animate()
  
  function* makeRangeIterator(start = 0, end = Infinity, step = 1) {
      let iterationCount = 0;
      for (let i = start; i < end; i += step) {
          iterationCount++;
          yield i;
      }
      return iterationCount;
  }
  
  
  /* Generator code (iterator) */
  /* ======================== */
  //
  while (true) {
    if (!clicked) {
      animate();
      update();
      context.fillStyle = "black";
      context.fillText("Animation with manual data control", 10, 10);
    }
    await Promises.delay(33);
    yield (rain.items);
  } // Time-delayed

  /* No line is executed after 'yield' */
  return context.canvas;
}
);
  main.variable(observer("learning_d3_mapping_8_4")).define("learning_d3_mapping_8_4", ["d3","model","rain","context","canvas","drawBackground","Promises"], async function*(d3,model,rain,context,canvas,drawBackground,Promises)
{
  /**
   * Learning D3.js 4 Mapping by larsvers
   * Example of animating with d3 data control
   * From: https://github.com/larsvers/Learning-D3.js-4-Mapping/blob/master/chapter-8/08_04b.html
   */
  
  /* Enter Exit Update and Draw the rain */
  /* =================================== */
  // Create in-memory base for elements
  const houseSelection = d3.select(model);
  const rainSelection = houseSelection.select('defs').append('g').attr('id', 'rain'); // d3.select(document.createElement('g')); // Offscreen svg element
  const dur = 3000;
  const rainDrops = rain.createDrops();
  let running = false;
  let started = false;
  let clicked = false;
  
  context.canvas.addEventListener('click', d => clicked = true);

  function databind (data) {
    console.log('Running? ', running);
    
    if (running) return false;
    
    const join = rainSelection.selectAll('circle.drop')
      .data(data, d => d.id);

    const enter = join.enter()
      .append('circle')
      .attr('class', 'drop')
      .attr('cx', d => d.xCloud)
      .attr('cy', d => d.yCloud)
      .attr('r', (d, i) => {
        return d.radiusCloud;
      })
      .text(d => '(x:' + Math.floor(d.xCloud) + ',  y:' + Math.floor(d.yCloud) + ')')
      .attr('fill', 'rgba(0, 0, 255)')
      .attr('fill-opacity', '0')
      .transition().delay((d, i) => i * 2)
      .attr('fill', 'rgba(0, 0, 255)')
      .attr('fill-opacity', '0.5');

    const update = join.transition() // implicit update()
      .duration(d => Math.random()*1000 + 900)
      .delay((d, i) => (i/data.length)*dur)
      .ease(d3.easeLinear)
      .attr('cx', d => d.xPuddle)
      .attr('cy', d => d.yPuddle)
      .attr('r', (d, i) => {
        return d.radiusPuddle;
      })
      .text(d => '(x:' + Math.floor(d.xPuddle) + ',  y:' + Math.floor(d.yPuddle) + ')');

    const exit = join.exit()
      .transition()
      .duration(dur)
      .delay((d, i) => i)
      .attr('r', d => d.radiusGrass)
      .attr('fill', '#01A611');
    
  } // databind()
  
  function drawRainScene() {
    
    // Cloud
    // point cloud roughly from 60,10 to 540, 70
    context.beginPath();
    context.moveTo(65, 65);
    context.lineTo(535, 65);
    context.bezierCurveTo(560, 5, 441, 5, 441, 40);
    context.bezierCurveTo(441, 0, 347, 0, 347, 40);
    context.bezierCurveTo(347, 5, 253, 5, 253, 40);
    context.bezierCurveTo(253, 10, 159, 10, 159, 40);
    context.bezierCurveTo(159, 15, 40, 15, 65, 65);
    context.closePath();
    context.fillStyle = '#f7f7f7';
    context.fill();

    // Rain path
    // cloud shape from 65, 65 to 535, 65
    context.beginPath();
    context.moveTo(65, 70);
    context.lineTo(535, 70);
    context.lineTo(530, canvas.height + 20);
    context.lineTo(45, canvas.height + 20);
    context.closePath();
    context.fillStyle = '#ffffff';
    context.fill();
    
    // Puddle
    // puddle shape from 30, 250 to 560, 270
    context.save();
    context.translate(0, -20);
    context.beginPath();
    context.moveTo(529.52,256.19);
    context.bezierCurveTo(532.01,260.53,513.31,265.85,516.94,272.4);
    context.bezierCurveTo(521.06,279.82,547.94,278.27,553.81,286.4);
    context.bezierCurveTo(557.57,291.58,552.04,299.53,542.08,303.045);
    context.bezierCurveTo(520.38,310.726,493.13,291.9,444.8,292.045);
    context.bezierCurveTo(410.16,292.184,409.0,301.976,364.45,307.383);
    context.bezierCurveTo(302.314,314.91,237.732,304.003,237.0,296.383);
    context.bezierCurveTo(236.582,290.383,276.83,287.115,275.633,282.75);
    context.bezierCurveTo(273.71,275.856,167.702,276.425,166.71,281.485);
    context.bezierCurveTo(166.073,284.753,209.81,287.045,209.44,291.124);
    context.bezierCurveTo(208.85,297.744,92.88,304.52,83.76,291.124);
    context.bezierCurveTo(78.85,283.90,106.86,273.726,100.52,268.77);
    context.bezierCurveTo(94.66,264.20,68.52,271.16,39.35,264.83);
    context.bezierCurveTo(32.35,263.314,26.7303,261.36,25.118,258.26);
    context.bezierCurveTo(23.78,255.71,34.735,251.362,43.54,250.814);
    context.bezierCurveTo(56.446,250.982,453.02,250.753,458.2,250.883);
    context.bezierCurveTo(506.06,249.68,525,248.36,529.52,256.19);
    context.closePath();
    context.fillStyle = "rgba(255, 255, 255, 0.75)";
    context.fill();
    context.restore();
  } // drawRainScene()
  
  function rainAnimation (data) {
    const t = d3.timer(elapsed => {
      running = elapsed > 1 && elapsed < (dur) ? true : false;
      draw(context);
      d3.selectAll('button').style('color', '#aaa');
      if (elapsed > dur * 2) {
        d3.selectAll('button').style('color', '#555');
        t.stop();
      }
    });
    
  } // rainAnimation()
  
  function enterRain (data) {
    databind(data);
    rainAnimation(data);
  }
  
  function updateRain (data) {
    databind(data);
    rainAnimation(data);
  }
  
  function exitRain (data) {
    databind(data);	
    rainAnimation(data);
  }
  
  function draw (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawRainScene();
    drawBackground(canvas.width/4, -10);
    
    const elements = rainSelection
      .selectAll('circle.drop')
      .each(function (d, i) {
        const node = d3.select(this);
        const op = ctx.globalCompositeOperation;
        ctx.save();
        ctx.beginPath();
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = node.attr('fill');
        if (node.attr('fill-opacity'))
          ctx.fillStyle = ctx.fillStyle.replace(')', ', '+ node.attr('fill-opacity') +')');
        ctx.arc(node.attr('cx'), node.attr('cy'), node.attr('r'), 0, 2*Math.PI);
        ctx.fill();
        ctx.globalCompositeOperation = op;
        ctx.restore();
      });
    
    context.fillStyle = "black";
    if (clicked) {
      context.fillText("Animation with D3 data control", canvas.width - 150, 10);
    } else {
      context.fillText("*Click to begin animation with D3 data control", canvas.width - 180, 10);
    }
  }
  
  /* Generator code (iterator) */
  /* ======================== */
  //
  while (true) {
    if (started === false && clicked === true) {
      started = true;
      enterRain(rainDrops);
      setTimeout(updateRain, dur * 3, rainDrops);
      setTimeout(exitRain, dur * 5, []);
    } else {
      draw(context);
    }
    
    await Promises.delay(33);
    yield (rainSelection.node().children);
  } // Time-delayed
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### Maps on Canvas`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`...`
)});
  main.variable(observer()).define(["d3Geo","d3","d3GeoProj","model","topojson","Stats","context"], function(d3Geo,d3,d3GeoProj,model,topojson,Stats,context)
{
  for (const g in d3Geo) {
    d3[g] = d3Geo[g];
  }
  
  for (const g in d3GeoProj) {
    d3[g] = d3GeoProj[g];
  }
  
  /* Set up global variables and utilities */
  /* ===================================== */
  var width = 1000,
      height = 600,
      airportMap;
  // speed() translates increasing input to increasing speed
  function speed(x) {
    x = x > 99 ? 99 : x;
    x = x < 1 ? 1 : x;
    return -x + 100;
  } // speed()
  /* Set up projection, path generator and map*/
  /* ========================================= */
  var projection = d3.geoRobinson()
      .scale(180)
      .translate([width / 2, height / 2]);
  var path = d3.geoPath()
      .projection(projection)
      .pointRadius(1);
  var svg = d3.select(model) // .select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);
  
  /* Set up functions to animate flights */
  /* =================================== */
  // Transition plane along path
  function transitionPath(plane, routeLength, wayPoints) {
    plane.transition()
      .duration(routeLength * speed(40))
      .attrTween('transform', interpolatePoints(wayPoints))
      .on('end', function() { transitionPath(plane, routeLength, wayPoints); });
  } // transitionPath()
  
  // Custom interpolator for the transition along wayPoints
  function interpolatePoints(wayPoints) {
    return function() {
      return function(t) {
        var index = Math.floor(t * (wayPoints.length-1));
        return 'translate(' + wayPoints[index].x + ', ' + wayPoints[index].y + ')'
      };
    };
  } // interpolatePoints()
  
  // The planeModule builds out the planes (circles)
  // and the route along which the plane moves
  var planeModule = {
    planes: [],
    planeRoutes: [],
    getAllRoutes: function(routes) {
      var allRoutes = [];
      routes.forEach(function(el) {
        var arr = [el.source_airport, el.destination_airport];
        allRoutes.push(arr);
      });
      this.planeRoutes = allRoutes;
    },
    getPlane: function() {
      var planeCircle = svg.append('path')
          .attr('class', 'plane')
          .attr('d', 'M-1,0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0');
      return planeCircle;
    },
    getRoute: function(route) {
      // Get plane route coords
      var origin = route[0];
      var destination = route[1];
      // Draw route
      var routePath = svg.append('path')
          .datum({
            type: 'LineString', 
            coordinates: [
              airportMap.get(origin).geometry.coordinates, 
              airportMap.get(destination).geometry.coordinates
            ]
          })
          .attr('class', 'route')
          .attr('d', path);
      var routeLength = routePath.node().getTotalLength()
      return {
        routePath: routePath,
        routeLength: routeLength
      };
    },
    getWayPoints: function(routeSvgPath) {
      var planeWayPoints = [];
      var path = routeSvgPath.node();
      var totalPoints = Math.floor(path.getTotalLength() * 2.5); // the multiplicator affects speed, quantity and precision of points
      d3.range(totalPoints).forEach(function(el, i) {
        var DOMPoints = path.getPointAtLength(i/2.5);
        planeWayPoints.push({ x: DOMPoints.x, y: DOMPoints.y });
      });
      return planeWayPoints;
    },
    makePlane: function(routes) {
      this.getAllRoutes(routes);
      var that = this;
      this.planeRoutes.forEach(function(el) {
        var plane = that.getPlane();
        var routePath = that.getRoute(el).routePath;
        var routeLength = that.getRoute(el).routeLength;
        var wayPoints = that.getWayPoints(routePath);
        // This version can only take planes with a wayPoints.length of 2+
        // Otherwise it won't transition in interpolatePoints()
        if (wayPoints.length > 1) {
          that.planes.push({
            plane: plane,
            routeLength: routeLength,
            wayPoints: wayPoints
          });
        }
      });
    }
  };
  /* Set up functions to draw scene */
  /* ============================== */
  function drawMap(world) {
    var mapData = topojson.feature(world, world.objects.countries).features;
    svg.append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(mapData)
        .enter()
      .append('path')
        .attr('d', path);
  } // drawMap()
  function drawAirports(airports) {
    svg.append('g')
        .attr('class', 'airports')
        .selectAll('path')
        .data(airports)
        .enter()
      .append('path')
        .attr('id', function(d) { return d.id; })
        .attr('d', path);
  } // drawAirports()
  /* Set up visual with loaded data */
  /* ============================== */
  function ready(routes, airports) {
    /* Draw airports */
    /* ------------- */
    // Set airports' geo coordinates
    var airportLocation = [];
    airports.forEach(function(el) {
      var obj = {};
      obj.type = 'Feature';
      obj.id = el.iata;
      obj.geometry = {
        type: 'Point',
        coordinates: [+el.long, +el.lat]
      };
      obj.properties = {};
      airportLocation.push(obj);
    });
    // Create airport map for lookup
    airportMap = d3.map(airportLocation, function(d) { return d.id; });
    // Redraw airports (world map is drawn only once on initialization)
    drawAirports(airportLocation);
    /* Animate planes along routes */
    /* --------------------------- */
    // Recode route data
    var routeFromTo = [];
    routes.forEach(function(el) {
      var arr = [el.source_airport, el.destination_airport];
      routeFromTo.push(arr);
    });
    // Make planes
    planeModule.makePlane(routes);
    // Make the planes fly
    planeModule.planes.forEach(function(el) {
      transitionPath(el.plane, el.routeLength, el.wayPoints);
    });
  } // ready
  /* Loaded data and handle user input */
  /* ================================= */
  d3.json('https://raw.githubusercontent.com/larsvers/Learning-D3.js-4-Mapping/master/chapter-9/data/countries.topo.json').then(function(world) {

    // Draw the world
    drawMap(world);
    
    setInterval(function () {
      console.log('Drawing flight paths...');
      
      // Remove everything but the world
      d3.selectAll('.airports, .route, .plane').remove();
      // Get the number of flights per clicked button
      var flights = 100;
      var routes = d3.csv('https://raw.githubusercontent.com/larsvers/Learning-D3.js-4-Mapping/master/chapter-9/data/routes_' + flights + '.csv').then(function(routes){ return routes; });
      var airports = d3.csv('https://raw.githubusercontent.com/larsvers/Learning-D3.js-4-Mapping/master/chapter-9/data/airports_' + flights + '.csv').then(function(airports){ return airports; });
      Promise.all([routes, airports]).then(function(response) {
        var routesResolved = response[0];
        var airportsResolved = response[1];
        ready(routesResolved, airportsResolved)
      });
    }, 33000); // handleFlights()
  }); // d3.json()
  /* Performance stats */
  /* ================= */
  // stats.js
  // (function(){
  //   var script=document.createElement('script');
  //   script.onload=function(){
      var stats=new Stats();
      stats.dom.setAttribute('style',
          stats.dom.getAttribute('style')
              .replace('absolute', 'fixed')
              .replace('top', 'bottom'));
      context.canvas.parentNode.appendChild(stats.dom);
      requestAnimationFrame(function loop(){
        stats.update();
        requestAnimationFrame(loop);
      });
  //   };
  //   script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
  //   document.head.appendChild(script);
  // })();
  
  return svg.node().children[0];
}
);
  main.variable(observer("Stats")).define("Stats", ["require"], function(require){return(
require('//rawgit.com/mrdoob/stats.js/master/build/stats.min.js')
)});
  main.variable(observer("d3Geo")).define("d3Geo", ["require"], function(require){return(
require('d3-geo')
)});
  main.variable(observer("d3GeoProj")).define("d3GeoProj", ["require"], function(require){return(
require('d3-geo-projection')
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require('topojson')
)});
  main.variable(observer("model")).define("model", ["svg"], function(svg){return(
svg`<svg version="1.1" 
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
	width="512" height="256">
  <title>House SVG</title>
  <desc>Basic elements and styles in an SVG document</desc>
  
  <style type="text/css">/*<![CDATA[*/
    * {
      stroke: #000;
      stroke-opacity: 0.5;
      fill:none;
      fill-opacity: 1.0;
    }

    rect {
      stroke: none;
    }

    rect#house {
      fill: royalblue;
    }

    rect#door {
      fill: brown;
      fill-opacity: 0.75;
    }

    rect#window {
      fill: white;
      fill-opacity: 0.75;
    }

    circle {
      fill: #00F;
    }

    polygon {
      fill: #A52A2A;
    }
  /*]]>*/</style>

  <defs>
    <rect id="house" x="178" y="150" width="200" height="100" />

    <rect id="door" x="188" y="180" width="40" height="60" />

    <g transform="translate(128, 180)">
      <rect id="window" x="128" y="0" width="60" height="30" />
    </g>

    <polygon id="roof" 
      points="178, 150
              378, 150
              278, 100" />
  </defs>
</svg>
`
)});
  return main;
}
