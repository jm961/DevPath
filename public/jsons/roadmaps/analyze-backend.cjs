const fs = require("fs");

const data = JSON.parse(fs.readFileSync("backend.json", "utf8"));
const controls = data.mockup.controls.control;

console.log(`Total controls: ${controls.length}\n`);

// Group by typeID to see what we have
const typeGroups = {};
controls.forEach((control) => {
  const type = control.typeID;
  if (!typeGroups[type]) {
    typeGroups[type] = [];
  }
  typeGroups[type].push(control);
});

console.log("=== CONTROL TYPES ===");
Object.entries(typeGroups).forEach(([type, items]) => {
  console.log(`${type}: ${items.length} items`);
});

// Check for duplicate IDs
const ids = new Map();
const duplicates = [];
controls.forEach((control) => {
  const id = control.ID;
  if (ids.has(id)) {
    duplicates.push(id);
  }
  ids.set(id, (ids.get(id) || 0) + 1);
});

if (duplicates.length > 0) {
  console.log(`\n=== DUPLICATE IDs FOUND: ${duplicates.length} ===`);
  duplicates.slice(0, 10).forEach((id) => {
    const items = controls.filter((c) => c.ID === id);
    console.log(`\nID ${id} appears ${items.length} times:`);
    items.forEach((item, i) => {
      console.log(
        `  ${i + 1}. ${item.typeID} at (${item.x}, ${item.y}) - ${
          item.properties?.text?.substring(0, 30) || "N/A"
        }`
      );
    });
  });
}

// Check for items with same zOrder
const zOrderGroups = {};
controls.forEach((control) => {
  const z = control.zOrder;
  if (!zOrderGroups[z]) {
    zOrderGroups[z] = [];
  }
  zOrderGroups[z].push(control);
});

console.log("\n=== Z-ORDER ISSUES ===");
let zIssues = 0;
Object.entries(zOrderGroups).forEach(([z, items]) => {
  if (items.length > 10 && items[0].typeID !== "Arrow") {
    console.log(
      `zOrder ${z}: ${items.length} items (potential stacking issue)`
    );
    zIssues++;
  }
});

if (zIssues === 0) {
  console.log("No major z-order issues detected");
}

// Check for very close positioning (within 5px)
console.log("\n=== ITEMS TOO CLOSE TOGETHER ===");
let closeItems = [];
controls.forEach((control, i) => {
  if (
    control.typeID === "Canvas" ||
    control.typeID === "Arrow" ||
    control.typeID === "__group__"
  )
    return;

  controls.slice(i + 1).forEach((other) => {
    if (
      other.typeID === "Canvas" ||
      other.typeID === "Arrow" ||
      other.typeID === "__group__"
    )
      return;

    const dx = Math.abs(parseInt(control.x) - parseInt(other.x));
    const dy = Math.abs(parseInt(control.y) - parseInt(other.y));

    if (dx < 5 && dy < 5 && (dx > 0 || dy > 0)) {
      closeItems.push({
        item1: {
          id: control.ID,
          x: control.x,
          y: control.y,
          text: control.properties?.text,
        },
        item2: {
          id: other.ID,
          x: other.x,
          y: other.y,
          text: other.properties?.text,
        },
        distance: Math.sqrt(dx * dx + dy * dy),
      });
    }
  });
});

closeItems.slice(0, 10).forEach((pair) => {
  console.log(
    `Items ${pair.item1.id} and ${pair.item2.id} are ${pair.distance.toFixed(
      1
    )}px apart`
  );
  console.log(
    `  ${pair.item1.text?.substring(0, 30)} at (${pair.item1.x}, ${
      pair.item1.y
    })`
  );
  console.log(
    `  ${pair.item2.text?.substring(0, 30)} at (${pair.item2.x}, ${
      pair.item2.y
    })`
  );
});

if (closeItems.length > 10) {
  console.log(`... and ${closeItems.length - 10} more pairs`);
}
