// https://observablehq.com/@dancingfrog/d3-mapping-on-canvas@1387
export default function define (runtime, observer) {
    const main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
        return (
            md`# D3 Mapping on Canvas`
        )
    });
    main.variable(observer("canvas")).define("canvas", ["DOM"], function (DOM) {
        return (
            DOM.canvas(1000, 600)
        )
    });
    main.variable(observer("context")).define("context", ["canvas"], function (canvas) {
            return canvas.getContext('2d');
        }
    );
    main.variable(observer("D3_Mapping_On_Canvas")).define(
        "D3_Mapping_On_Canvas",
        [ "context", "d3", "d3Geo", "d3GeoProj", "model", "topojson", "Stats" ],
        function (context, d3, d3Geo, d3GeoProj, model, topojson, Stats) {
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
            function speed (x) {
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
            function transitionPath (plane, routeLength, wayPoints) {
                plane.transition()
                    .duration(routeLength * speed(40))
                    .attrTween('transform', interpolatePoints(wayPoints))
                    .on('end', function () {
                        transitionPath(plane, routeLength, wayPoints);
                    });
            } // transitionPath()

            // Custom interpolator for the transition along wayPoints
            function interpolatePoints (wayPoints) {
                return function () {
                    return function (t) {
                        var index = Math.floor(t * (wayPoints.length - 1));
                        return 'translate(' + wayPoints[index].x + ', ' + wayPoints[index].y + ')'
                    };
                };
            } // interpolatePoints()

            // The planeModule builds out the planes (circles)
            // and the route along which the plane moves
            var planeModule = {
                planes: [],
                planeRoutes: [],
                getAllRoutes: function (routes) {
                    var allRoutes = [];
                    routes.forEach(function (el) {
                        var arr = [el.source_airport, el.destination_airport];
                        allRoutes.push(arr);
                    });
                    this.planeRoutes = allRoutes;
                },
                getPlane: function () {
                    var planeCircle = svg.append('path')
                        .attr('class', 'plane')
                        .attr('d', 'M-1,0a1,1 0 1,0 2,0a1,1 0 1,0 -2,0');
                    return planeCircle;
                },
                getRoute: function (route) {
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
                getWayPoints: function (routeSvgPath) {
                    var planeWayPoints = [];
                    var path = routeSvgPath.node();
                    var totalPoints = Math.floor(path.getTotalLength() * 2.5); // the multiplicator affects speed, quantity and precision of points
                    d3.range(totalPoints).forEach(function (el, i) {
                        var DOMPoints = path.getPointAtLength(i / 2.5);
                        planeWayPoints.push({ x: DOMPoints.x, y: DOMPoints.y });
                    });
                    return planeWayPoints;
                },
                makePlane: function (routes) {
                    this.getAllRoutes(routes);
                    var that = this;
                    this.planeRoutes.forEach(function (el) {
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
            function drawMap (world) {
                var mapData = topojson.feature(world, world.objects.countries).features;
                svg.append('g')
                    .attr('class', 'countries')
                    .selectAll('path')
                    .data(mapData)
                    .enter()
                    .append('path')
                    .attr('d', path);
            } // drawMap()
            function drawAirports (airports) {
                svg.append('g')
                    .attr('class', 'airports')
                    .selectAll('path')
                    .data(airports)
                    .enter()
                    .append('path')
                    .attr('id', function (d) {
                        return d.id;
                    })
                    .attr('d', path);
            } // drawAirports()
            /* Set up visual with loaded data */

            /* ============================== */
            function ready (routes, airports) {
                /* Draw airports */
                /* ------------- */
                // Set airports' geo coordinates
                var airportLocation = [];
                airports.forEach(function (el) {
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
                airportMap = d3.map(airportLocation, function (d) {
                    return d.id;
                });
                // Redraw airports (world map is drawn only once on initialization)
                drawAirports(airportLocation);
                /* Animate planes along routes */
                /* --------------------------- */
                // Recode route data
                var routeFromTo = [];
                routes.forEach(function (el) {
                    var arr = [el.source_airport, el.destination_airport];
                    routeFromTo.push(arr);
                });
                // Make planes
                planeModule.makePlane(routes);
                // Make the planes fly
                planeModule.planes.forEach(function (el) {
                    transitionPath(el.plane, el.routeLength, el.wayPoints);
                });
            } // ready
            /* Loaded data and handle user input */
            /* ================================= */
            d3.json('https://raw.githubusercontent.com/larsvers/Learning-D3.js-4-Mapping/master/chapter-9/data/countries.topo.json').then(function (world) {

                // Draw the world
                drawMap(world);

                setInterval(function () {
                    console.log('Drawing flight paths...');

                    // Remove everything but the world
                    d3.selectAll('.airports, .route, .plane').remove();
                    // Get the number of flights per clicked button
                    var flights = 100;
                    var routes = d3.csv('https://raw.githubusercontent.com/larsvers/Learning-D3.js-4-Mapping/master/chapter-9/data/routes_' + flights + '.csv').then(function (routes) {
                        return routes;
                    });
                    var airports = d3.csv('https://raw.githubusercontent.com/larsvers/Learning-D3.js-4-Mapping/master/chapter-9/data/airports_' + flights + '.csv').then(function (airports) {
                        return airports;
                    });
                    Promise.all([routes, airports]).then(function (response) {
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
            var stats = new Stats();
            stats.dom.setAttribute('style',
                stats.dom.getAttribute('style')
                    .replace('absolute', 'fixed')
                    .replace('top', 'bottom'));
            context.canvas.parentNode.appendChild(stats.dom);
            requestAnimationFrame(function loop () {
                stats.update();
                requestAnimationFrame(loop);
            });
            //   };
            //   script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';
            //   document.head.appendChild(script);
            // })();

            return svg.node();
        }
    );
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
        return (
            require('d3')
        )
    });
    main.variable(observer("d3Geo")).define("d3Geo", ["require"], function (require) {
        return (
            require('d3-geo')
        )
    });
    main.variable(observer("d3GeoProj")).define("d3GeoProj", ["require"], function (require) {
        return (
            require('d3-geo-projection')
        )
    });
    main.variable(observer("topojson")).define("topojson", ["require"], function (require) {
        return (
            require('topojson')
        )
    });
    main.variable(observer("Stats")).define("Stats", ["require"], function (require) {
        return (
            require('//rawgit.com/mrdoob/stats.js/master/build/stats.min.js')
        )
    });
    main.variable(observer("model")).define("model", ["svg"], function (svg) {
        return (
            svg`<svg version="1.1" 
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
	width="1000" height="600">
  <title>House SVG</title>
  <desc>Basic elements and styles in an SVG document</desc>
  
  <style type="text/css">/*<![CDATA[*/
    * {
      stroke: #000;
      stroke-opacity: 0.5;
      fill:none;
      fill-opacity: 1.0;
    }
  /*]]>*/</style>

</svg>
`
        )
    });
    return main;
}
