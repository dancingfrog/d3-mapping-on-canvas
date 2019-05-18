// https://observablehq.com/@dancingfrog/d3-mapping-on-canvas
import D3_Mapping_On_Canvas from "../@dancingfrog/D3_Mapping_On_Canvas.js";

export default function (runtime, observer) {
    const main = runtime.module();
    main.variable(observer()).define(
        ["md"],
        function (md) {
            return (
                md`# D3 Mapping on Canvas`
            )
        }
    );
    main.variable(observer("D3_Mapping_On_Canvas")).define(
        "D3_Mapping_On_Canvas",
        [ "context", "d3", "d3Geo", "d3GeoProj", "model", "topojson", "Stats" ],
        D3_Mapping_On_Canvas
    );
    main.variable(observer("canvas")).define(
        "canvas",
        ["DOM"],
        function (DOM) {
            return (
                DOM.canvas(1000, 600)
            )
        }
    );
    main.variable(observer("context")).define(
        "context",
        ["canvas"],
        function (canvas) {
            return canvas.getContext('2d');
        }
    );
    main.variable(observer("d3")).define(
        "d3",
        ["require"],
        function (require) {
            return (
                require('d3')
            )
        }
    );
    main.variable(observer("d3Geo")).define(
        "d3Geo",
        ["require"],
        function (require) {
            return (
                require('d3-geo')
            )
        }
    );
    main.variable(observer("d3GeoProj")).define(
        "d3GeoProj",
        ["require"],
        function (require) {
            return (
                require('d3-geo-projection')
            )
        }
    );
    main.variable(observer("topojson")).define(
        "topojson",
        ["require"],
        function (require) {
            return (
                require('topojson')
            )
        }
    );
    main.variable(observer("Stats")).define(
        "Stats",
        ["require"],
        function (require) {
            return (
                require('//rawgit.com/mrdoob/stats.js/master/build/stats.min.js')
            )
        }
    );
    main.variable(observer("model")).define(
        "model",
        ["svg"],
        function (svg) {
            return (svg`
<svg version="1.1" 
    xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink"
    width="1000" height="600">
  <title>Model</title>
  <desc>SVG document serving as repository for d3 data</desc>
  
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
        }
    );
    return main;
}
