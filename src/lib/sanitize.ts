import sanitizeHtml from "sanitize-html"

const SVG_TAGS = [
  "svg", "path", "circle", "rect", "line", "polyline", "polygon", "ellipse",
  "g", "text", "tspan",
]

const SVG_ATTRS = [
  "xmlns", "viewBox", "width", "height", "fill", "stroke", "stroke-width",
  "stroke-linecap", "stroke-linejoin", "stroke-dasharray", "d", "cx", "cy",
  "r", "rx", "ry", "x", "y", "x1", "y1", "x2", "y2", "points", "transform",
  "opacity", "fill-opacity", "stroke-opacity", "font-size", "font-family",
  "text-anchor",
]

export function sanitizeSvg(svg: string): string {
  return sanitizeHtml(svg, {
    allowedTags: SVG_TAGS,
    allowedAttributes: { "*": SVG_ATTRS },
    disallowedTagsMode: "discard",
    parser: { xmlMode: true },
  }).trim()
}
