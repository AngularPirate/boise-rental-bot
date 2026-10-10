# DESIGN: Direction A, "Survey"
World: a USGS-style topographic quad. The workflow is a surveyed route.
Color (light only): paper #F6F8F1, paper-2 #EDF1E4, woodland #D9EBCB, woodland ink #2F5A2A, contour #8A4B22, contour-soft #C79A72, water #1D63A6, ink #141B16, ink-2 #3B4A3F, route/overprint magenta #A3156F (deep #7E0F55, wash #F7E3EE), rule #B9C4AE.
Type: Archivo (variable width 62-125; display at 70-85% width, 800 weight; map lettering uppercase tracked) + Public Sans (text).
Components: map frame with neat-line inset, waypoint triangles, legend strip with map symbols, sheet cards with magenta corner tick, dashed route timeline (diamond stops), solid = in progress / dashed = planned convention, dark contact collar.
Motion: route draws once on load (stroke-dashoffset, expo ease-out); field notes settle on change. All off under reduced motion.
Signature: procedural contour map (marching squares in js/map.js) + six waypoint buttons with arrow-key roving and a live field-notes panel.
