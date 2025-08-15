/**
 * Advanced Roof Measurement Utility for Enterprise Use
 */

 // Polygon math helpers
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Shoelace formula for area (in px²)
export function polygonAreaPx(points) {
  if (!points || points.length < 3) return 0;
  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return Math.abs(area) / 2;
}

// Perimeter in px
export function polygonPerimeterPx(points) {
  if (!points || points.length < 2) return 0;
  let peri = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    peri += distance(points[i], points[j]);
  }
  return peri;
}

// Edge lengths for each segment
export function edgeLengthsPx(points) {
  let edges = [];
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    edges.push(distance(points[i], points[j]));
  }
  return edges;
}

// Polygon centroid
export function polygonCentroid(points) {
  let x = 0, y = 0;
  for (let i = 0; i < points.length; i++) {
    x += points[i].x;
    y += points[i].y;
  }
  return { x: x / points.length, y: y / points.length };
}

// Bounding box
export function getBoundingBox(points) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    minX: Math.min(...xs),
    minY: Math.min(...ys),
    maxX: Math.max(...xs),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}

// Polygon closure check
export function isClosed(points, tolerance = 10) {
  if (points.length < 3) return false;
  return distance(points[0], points[points.length - 1]) < tolerance;
}

// Self-intersection check
export function isSelfIntersecting(points) {
  function linesIntersect(a, b, c, d) {
    function ccw(p1, p2, p3) {
      return (p3.y - p1.y) * (p2.x - p1.x) > (p2.y - p1.y) * (p3.x - p1.x);
    }
    return (ccw(a, c, d) !== ccw(b, c, d)) && (ccw(a, b, c) !== ccw(a, b, d));
  }
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    for (let j = i + 1; j < points.length; j++) {
      const c = points[j], d = points[(j + 1) % points.length];
      if (Math.abs(i - j) <= 1 || (i === 0 && j === points.length - 1)) continue;
      if (linesIntersect(a, b, c, d)) return true;
    }
  }
  return false;
}

// Overlap detection for multiple polygons
export function doPolygonsOverlap(polyA, polyB) {
  // Simple bounding box overlap, can be replaced with SAT/advanced algorithms for production
  const boxA = getBoundingBox(polyA);
  const boxB = getBoundingBox(polyB);
  return !(
    boxA.maxX < boxB.minX ||
    boxA.minX > boxB.maxX ||
    boxA.maxY < boxB.minY ||
    boxA.minY > boxB.maxY
  );
}

// Converts values to meters, feet, area, etc.
export function convertUnits(value, metersPerPx, type = 'length') {
  if (type === 'length') {
    return {
      meters: value * metersPerPx,
      feet: value * metersPerPx * 3.28084,
    };
  } else if (type === 'area') {
    return {
      sqm: value * Math.pow(metersPerPx, 2),
      sqft: value * Math.pow(metersPerPx * 3.28084, 2),
    };
  }
  return value;
}

// Roof pitch calculation (requires height and base length in meters)
export function calculateRoofPitch(baseMeters, heightMeters) {
  // Pitch in degrees and ratio
  const pitchRatio = heightMeters / baseMeters;
  const pitchDegrees = Math.atan(pitchRatio) * (180 / Math.PI);
  return { pitchRatio, pitchDegrees };
}

// Pricing calculator
export function calculatePrice(area, pricePerSqm = 50, pricePerSqft = null) {
  // Supports metric or imperial pricing
  let price = pricePerSqm ? area.sqm * pricePerSqm : 0;
  if (pricePerSqft) price = area.sqft * pricePerSqft;
  return price;
}

// Export functions
export function exportToCSV(result) {
  if (result.error) return '';
  const { area, perimeter, bbox, points } = result;
  let csv = 'x,y\n';
  points.forEach(p => { csv += `${p.x},${p.y}\n`; });
  csv += `Area(m2),${area.sqm}\nArea(ft2),${area.sqft}\nPerimeter(m),${perimeter.meters}\nPerimeter(ft),${perimeter.feet}\n`;
  csv += `BBox(minX),${bbox.minX}\nBBox(minY),${bbox.minY}\nBBox(maxX),${bbox.maxX}\nBBox(maxY),${bbox.maxY}\n`;
  return csv;
}

export function exportToJSON(result) {
  return JSON.stringify(result, null, 2);
}

// Main measurement helper
export function measureRoof(points, metersPerPx, opts = {}) {
  if (!points || points.length < 3) return { error: 'At least 3 points required.' };
  if (!isClosed(points)) return { error: 'Polygon not closed.' };
  if (isSelfIntersecting(points)) return { error: 'Polygon self-intersects.' };

  const areaPx = polygonAreaPx(points);
  const perimeterPx = polygonPerimeterPx(points);
  const area = convertUnits(areaPx, metersPerPx, 'area');
  const perimeter = convertUnits(perimeterPx, metersPerPx, 'length');
  const bbox = getBoundingBox(points);
  const centroid = polygonCentroid(points);
  const edgesPx = edgeLengthsPx(points);
  const edgesMeters = edgesPx.map(e => e * metersPerPx);
  const pitch = opts.baseMeters && opts.heightMeters
    ? calculateRoofPitch(opts.baseMeters, opts.heightMeters)
    : null;
  const price = opts.pricePerSqm || opts.pricePerSqft
    ? calculatePrice(area, opts.pricePerSqm, opts.pricePerSqft)
    : null;

  return {
    areaPx,
    perimeterPx,
    area,
    perimeter,
    bbox,
    centroid,
    edgesPx,
    edgesMeters,
    pitch,
    price,
    points,
    error: null,
  };
}

// Format for display/quote
export function formatMeasurement(result) {
  if (result.error) return `Error: ${result.error}`;
  return (
    `Area: ${result.area.sqm.toFixed(2)} m² (${result.area.sqft.toFixed(2)} ft²)\n` +
    `Perimeter: ${result.perimeter.meters.toFixed(2)} m (${result.perimeter.feet.toFixed(2)} ft)\n` +
    `Bounding box: ${result.bbox.width.toFixed(2)} px × ${result.bbox.height.toFixed(2)} px\n` +
    `Centroid: x=${result.centroid.x.toFixed(2)}, y=${result.centroid.y.toFixed(2)}\n` +
    (result.pitch ? `Pitch: ${result.pitch.pitchRatio.toFixed(2)} (${result.pitch.pitchDegrees.toFixed(2)}°)\n` : '') +
    (result.price ? `Estimated Price: $${result.price.toFixed(2)}\n` : '')
  );
}
