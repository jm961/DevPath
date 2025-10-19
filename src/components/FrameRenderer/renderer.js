import { wireframeJSONToSVG } from "roadmap-renderer";
import { httpGet } from "../../lib/http";
import { getUserResourceProgressApi } from "../../lib/progress-api";

export class Renderer {
  constructor() {
    this.resourceId = "";
    this.resourceType = "";
    this.jsonUrl = "";

    this.containerId = "resource-svg-wrap";

    this.init = this.init.bind(this);
    this.onDOMLoaded = this.onDOMLoaded.bind(this);
    this.jsonToSvg = this.jsonToSvg.bind(this);
    this.handleSvgClick = this.handleSvgClick.bind(this);
    this.prepareConfig = this.prepareConfig.bind(this);
    this.switchRoadmap = this.switchRoadmap.bind(this);
    this.enhanceSvgWithConnectors = this.enhanceSvgWithConnectors.bind(this);
    this.createCurvedPath = this.createCurvedPath.bind(this);
    this.resizeBoxesToFitContent = this.resizeBoxesToFitContent.bind(this);
    this.addGradientDefinitions = this.addGradientDefinitions.bind(this);
  }

  get containerEl() {
    return document.getElementById(this.containerId);
  }

  /**
   * Creates a smooth curved path between two points for mind-map style connectors
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @returns {string} SVG path data
   */
  createCurvedPath(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate control points for smooth bezier curves
    const curveFactor = Math.min(distance * 0.4, 100);

    // Determine curve direction based on relative positions
    let cp1x, cp1y, cp2x, cp2y;

    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal flow - smoother horizontal curves
      cp1x = x1 + curveFactor;
      cp1y = y1;
      cp2x = x2 - curveFactor;
      cp2y = y2;
    } else {
      // Vertical flow - smoother vertical curves
      cp1x = x1;
      cp1y = y1 + curveFactor;
      cp2x = x2;
      cp2y = y2 - curveFactor;
    }

    return `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`;
  }

  /**
   * Enhances the rendered SVG with futuristic curved connectors
   */
  enhanceSvgWithConnectors() {
    const svg = this.containerEl.querySelector("svg");
    if (!svg) return;

    console.log("🎨 Enhancing SVG with curved connectors...");

    // Add gradient definitions
    this.addGradientDefinitions(svg);

    // Get all existing lines in the SVG
    const lines = svg.querySelectorAll("line");
    const paths = svg.querySelectorAll("path");

    // Create a group for enhanced connectors
    let connectorsGroup = svg.querySelector("#enhanced-connectors");
    if (!connectorsGroup) {
      connectorsGroup = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      connectorsGroup.id = "enhanced-connectors";
      connectorsGroup.setAttribute("class", "futuristic-connectors");
      svg.insertBefore(connectorsGroup, svg.firstChild); // Insert at the beginning so it's behind other elements
    } else {
      connectorsGroup.innerHTML = ""; // Clear existing
    }

    // Enhance existing lines with curved paths
    lines.forEach((line, index) => {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));

      if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return;

      // Create curved path
      const pathData = this.createCurvedPath(x1, y1, x2, y2);

      // Create main glow path
      const glowPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      glowPath.setAttribute("d", pathData);
      glowPath.setAttribute("class", "connector-glow");
      glowPath.setAttribute("fill", "none");
      glowPath.setAttribute("stroke", "rgba(59, 130, 246, 0.15)");
      glowPath.setAttribute("stroke-width", "6");
      glowPath.setAttribute("stroke-linecap", "round");
      glowPath.setAttribute("stroke-linejoin", "round");
      glowPath.style.filter = "blur(4px)";
      glowPath.style.pointerEvents = "none";

      // Create main connector path
      const connectorPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      connectorPath.setAttribute("d", pathData);
      connectorPath.setAttribute("class", "connector-main");
      connectorPath.setAttribute("fill", "none");
      connectorPath.setAttribute("stroke", "rgba(59, 130, 246, 0.3)");
      connectorPath.setAttribute("stroke-width", "2");
      connectorPath.setAttribute("stroke-linecap", "round");
      connectorPath.setAttribute("stroke-linejoin", "round");
      connectorPath.style.pointerEvents = "none";

      // Add animated dash for flow effect
      const length = connectorPath.getTotalLength?.() || 0;
      if (length > 0) {
        connectorPath.style.strokeDasharray = `${length}`;
        connectorPath.style.strokeDashoffset = `${length}`;
        connectorPath.style.animation = "drawConnector 2s ease-out forwards";
        connectorPath.style.animationDelay = `${index * 0.05}s`;
      }

      connectorsGroup.appendChild(glowPath);
      connectorsGroup.appendChild(connectorPath);

      // Hide original line
      line.style.opacity = "0";
    });

    // Add animation keyframes if not already present
    if (!document.getElementById("connector-animations")) {
      const style = document.createElement("style");
      style.id = "connector-animations";
      style.textContent = `
        @keyframes drawConnector {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .futuristic-connectors .connector-main:hover {
          stroke: rgba(59, 130, 246, 0.6);
          stroke-width: 3;
        }
        
        .futuristic-connectors .connector-glow:hover {
          stroke: rgba(59, 130, 246, 0.3);
        }
      `;
      document.head.appendChild(style);
    }

    console.log("✨ Enhanced", lines.length, "connectors");
  }

  /**
   * Resize boxes to fit their text content
   */
  resizeBoxesToFitContent(svg) {
    const groups = svg.querySelectorAll(".clickable-group");
    let resizedCount = 0;

    groups.forEach((group) => {
      const rect = group.querySelector("rect");
      const text = group.querySelector("text");

      if (!rect || !text) return;

      // Get text bounding box
      const textBBox = text.getBBox();

      // Calculate required padding
      const paddingX = 16; // horizontal padding
      const paddingY = 12; // vertical padding

      // Calculate minimum required dimensions
      const minWidth = textBBox.width + paddingX * 2;
      const minHeight = textBBox.height + paddingY * 2;

      // Get current rect dimensions
      const currentWidth = parseFloat(rect.getAttribute("width"));
      const currentHeight = parseFloat(rect.getAttribute("height"));

      // Only resize if text doesn't fit
      if (
        textBBox.width > currentWidth - paddingX * 2 ||
        textBBox.height > currentHeight - paddingY * 2
      ) {
        const newWidth = Math.max(currentWidth, minWidth);
        const newHeight = Math.max(currentHeight, minHeight);

        rect.setAttribute("width", newWidth);
        rect.setAttribute("height", newHeight);

        // Center the text within the new box
        const rectX = parseFloat(rect.getAttribute("x"));
        const rectY = parseFloat(rect.getAttribute("y"));

        text.setAttribute("x", rectX + newWidth / 2);
        text.setAttribute("y", rectY + newHeight / 2);

        resizedCount++;
      }
    });

    console.log("📏 Resized", resizedCount, "boxes to fit content");
  }

  /**
   * Adds gradient definitions for enhanced visual effects
   */
  addGradientDefinitions(svg) {
    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    // Check if gradients already exist
    if (svg.querySelector("#textGradient")) return;

    // Add text gradient
    const textGradient = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "linearGradient"
    );
    textGradient.id = "textGradient";
    textGradient.setAttribute("x1", "0%");
    textGradient.setAttribute("y1", "0%");
    textGradient.setAttribute("x2", "100%");
    textGradient.setAttribute("y2", "0%");

    const stop1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop1.setAttribute("offset", "0%");
    stop1.setAttribute("style", "stop-color:rgb(59,130,246);stop-opacity:1");

    const stop2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "stop"
    );
    stop2.setAttribute("offset", "100%");
    stop2.setAttribute("style", "stop-color:rgb(139,92,246);stop-opacity:1");

    textGradient.appendChild(stop1);
    textGradient.appendChild(stop2);
    defs.appendChild(textGradient);

    // Add glow filter
    const filter = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "filter"
    );
    filter.id = "glow";
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const feGaussianBlur = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feGaussianBlur"
    );
    feGaussianBlur.setAttribute("stdDeviation", "4");
    feGaussianBlur.setAttribute("result", "coloredBlur");

    const feMerge = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feMerge"
    );
    const feMergeNode1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feMergeNode"
    );
    feMergeNode1.setAttribute("in", "coloredBlur");
    const feMergeNode2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "feMergeNode"
    );
    feMergeNode2.setAttribute("in", "SourceGraphic");

    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGaussianBlur);
    filter.appendChild(feMerge);
    defs.appendChild(filter);
  }

  prepareConfig() {
    if (!this.containerEl) {
      return false;
    }

    const dataset = this.containerEl.dataset;

    this.resourceType = dataset.resourceType;
    this.resourceId = dataset.resourceId;
    this.jsonUrl = dataset.jsonUrl;

    return true;
  }

  async topicToggleDone() {
    const { response, error } = await getUserResourceProgressApi({
      resourceId: this.resourceId,
      resourceType: this.resourceType,
    });

    if (!response) {
      console.error(error);
      return;
    }

    const { done } = response;
    done.forEach((topic) => {
      const topicEl = document.querySelector(`[data-group-id$="-${topic}"]`);

      if (topicEl) {
        topicEl.classList.add("done");
      }
    });
  }

  /**
   * @param { string } jsonUrl
   * @returns {Promise<SVGElement>}
   */
  jsonToSvg(jsonUrl) {
    if (!jsonUrl) {
      console.error("jsonUrl not defined in frontmatter");
      return null;
    }

    console.log(
      "🚀 Loading roadmap:",
      this.resourceType,
      this.resourceId,
      jsonUrl
    );

    this.containerEl.innerHTML = "";
    return Promise.all([
      fetch(jsonUrl)
        .then((res) => {
          console.log("📦 Fetch response:", res.status);
          if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
          }
          return res.json();
        })
        .then((json) => {
          console.log("✅ JSON loaded, converting to SVG...");
          return wireframeJSONToSVG(json, {
            fontURL: "/fonts/balsamiq.woff2",
          });
        })
        .then((svg) => {
          console.log("🎨 SVG created successfully");
          this.containerEl.replaceChildren(svg);
          console.log("✨ Roadmap rendered!");

          // Enhance with curved connectors after a short delay
          setTimeout(() => {
            this.enhanceSvgWithConnectors();
          }, 100);
        })
        .catch((error) => {
          console.error("❌ Error rendering roadmap:", error);
          const message = `
          <strong>There was an error loading the roadmap.</strong><br><br>
          
          <strong>Error:</strong> ${error.message}<br><br>
          
          <details style="text-align: left; max-width: 600px; margin: 1rem auto;">
            <summary style="cursor: pointer; color: #ef4444; font-weight: 600;">Technical Details</summary>
            <pre style="background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px; overflow-x: auto; margin-top: 1rem;">${
              error.stack || error.message
            }</pre>
          </details>
          
          <div style="margin-top: 1.5rem;">
            <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;">
              Try Again
            </button>
          </div>
        `;

          this.containerEl.innerHTML = `<div class="error" style="padding: 2rem; max-width: 800px; margin: 2rem auto;">${message}</div>`;
        }),
      this.topicToggleDone(),
    ]);
  }

  onDOMLoaded() {
    if (!this.prepareConfig()) {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const roadmapType = urlParams.get("r");

    if (roadmapType) {
      this.switchRoadmap(`/jsons/roadmaps/${roadmapType}.json`);
    } else {
      this.jsonToSvg(this.jsonUrl);
    }
  }

  switchRoadmap(newJsonUrl) {
    const newJsonFileSlug = newJsonUrl.split("/").pop().replace(".json", "");

    // Update the URL and attach the new roadmap type
    if (window?.history?.pushState) {
      const url = new URL(window.location);
      const type = this.resourceType[0]; // r for roadmap, b for best-practices

      url.searchParams.delete(type);
      url.searchParams.set(type, newJsonFileSlug);

      window.history.pushState(null, "", url.toString());
    }

    const pageType = this.resourceType.replace(/\b\w/g, (l) => l.toUpperCase());

    if (window.fireEvent) {
      window.fireEvent({
        // RoadmapClick, BestPracticesClick, etc
        category: `${pageType.replace("-", "")}Click`,
        // roadmap/frontend/switch-version
        action: `${this.resourceId}/switch-version`,
        // roadmap/frontend/switch-version
        label: `${newJsonFileSlug}`,
      });
    }

    this.jsonToSvg(newJsonUrl).then(() => {
      this.containerEl.setAttribute("style", "");
      // Enhance the new roadmap with connectors
      setTimeout(() => {
        this.enhanceSvgWithConnectors();
      }, 100);
    });
  }

  handleSvgClick(e) {
    // Only handle clicks within the SVG container
    if (!this.containerEl || !this.containerEl.contains(e.target)) {
      return;
    }

    const targetGroup = e.target.closest("g") || {};
    const groupId = targetGroup.dataset ? targetGroup.dataset.groupId : "";

    if (!groupId) {
      return;
    }

    e.stopImmediatePropagation();

    if (/^ext_link/.test(groupId)) {
      window.open(`https://${groupId.replace("ext_link:", "")}`);
      return;
    }

    if (/^json:/.test(groupId)) {
      // e.g. /roadmaps/frontend-beginner.json
      const newJsonUrl = groupId.replace("json:", "");

      this.switchRoadmap(newJsonUrl);
      return;
    }

    if (/^check:/.test(groupId)) {
      window.dispatchEvent(
        new CustomEvent(`${this.resourceType}.topic.toggle`, {
          detail: {
            topicId: groupId.replace("check:", ""),
            resourceType: this.resourceType,
            resourceId: this.resourceId,
          },
        })
      );
      return;
    }

    // Remove sorting prefix from groupId
    const normalizedGroupId = groupId.replace(/^\d+-/, "");

    window.dispatchEvent(
      new CustomEvent(`${this.resourceType}.topic.click`, {
        detail: {
          topicId: normalizedGroupId,
          resourceId: this.resourceId,
          resourceType: this.resourceType,
        },
      })
    );
  }

  init() {
    console.log("🎯 Renderer.init() called");

    if (document.readyState === "loading") {
      window.addEventListener("DOMContentLoaded", this.onDOMLoaded);
    } else {
      // DOM already loaded, run immediately
      console.log("📄 DOM already loaded, running onDOMLoaded now");
      this.onDOMLoaded();
    }

    // Only listen for clicks on the SVG container, not the entire window
    if (this.containerEl) {
      this.containerEl.addEventListener("click", this.handleSvgClick);
    }
    // window.addEventListener('contextmenu', this.handleSvgClick);
  }
}
