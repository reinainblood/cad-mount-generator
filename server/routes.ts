import type { Express } from "express";
import { createServer } from "http";
import { db } from "@db";
import { products, mounts } from "@db/schema";
import { eq } from "drizzle-orm";

async function parseAmazonProduct(url: string) {
  // In a real implementation, this would make requests to Amazon's API
  // For now, we'll detect keywords in the URL to return appropriate mock data
  const urlLower = url.toLowerCase();

  if (urlLower.includes('jetson') || urlLower.includes('nvidia')) {
    return {
      dimensions: { 
        width: 100,
        height: 29,
        depth: 87,
      },
      metadata: {
        name: "NVIDIA Jetson Nano Orin",
        weight: "95g",
        powerConnector: "USB-C",
        thermalDesign: "active",
        ports: {
          usb: 2,
          ethernet: 1,
          hdmi: 1
        }
      },
      productType: "compute_module",
      compatibleWith: ["heatsink", "fan", "case"]
    };
  }

  if (urlLower.includes('raspberry') || urlLower.includes('rpi')) {
    return {
      dimensions: {
        width: 85,
        height: 56,
        depth: 17
      },
      metadata: {
        name: "Raspberry Pi 4 Model B",
        weight: "46g",
        powerConnector: "USB-C",
        thermalDesign: "passive",
        ports: {
          usb: 4,
          ethernet: 1,
          hdmi: 2,
          gpio: 40
        }
      },
      productType: "compute_module",
      compatibleWith: ["heatsink", "fan", "case", "camera", "display"]
    };
  }

  if (urlLower.includes('arduino')) {
    return {
      dimensions: {
        width: 68.6,
        height: 53.4,
        depth: 12
      },
      metadata: {
        name: "Arduino Uno R4",
        weight: "25g",
        powerConnector: "USB-C",
        thermalDesign: "passive",
        ports: {
          usb: 1,
          gpio: 32
        }
      },
      productType: "compute_module",
      compatibleWith: ["case", "shield"]
    };
  }

  throw new Error("Unsupported product. Currently supporting Jetson, Raspberry Pi, and Arduino boards");
}

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  app.get("/api/parse-amazon", async (req, res) => {
    try {
      const url = req.query.url as string;

      if (!url) {
        return res.status(400).json({ 
          error: "URL is required",
          message: "Please provide an Amazon product URL"
        });
      }

      const productData = await parseAmazonProduct(url);

      const result = await db.insert(products).values({
        amazonUrl: url,
        dimensions: productData.dimensions,
        metadata: productData.metadata,
        productType: productData.productType,
        compatibleWith: productData.compatibleWith,
      }).returning();

      res.json(productData);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to parse Amazon URL";
      res.status(400).json({ error: message });
    }
  });

  app.post("/api/generate-scad", async (req, res) => {
    try {
      const { productData, mountingRequirements } = req.body;

      // Enhanced SCAD generation with Jetson-specific features
      const scadCode = generateJetsonScad(productData, mountingRequirements);

      const result = await db.insert(mounts).values({
        productId: 1, // Replace with actual product ID
        requirements: mountingRequirements,
        scadCode,
        mountType: mountingRequirements.mountType || 'case',
      }).returning();

      res.json({ scadCode });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate SCAD code" });
    }
  });

  return httpServer;
}

function generateJetsonScad(productData: any, requirements: any) {
  const { width, height, depth } = productData.dimensions;
  const wallThickness = 2;
  const ventHoles = requirements.cooling === 'active';

  return `
// Generated SCAD code for Jetson Nano Orin
$fn = 50;

module mainBody() {
  difference() {
    // Outer shell
    cube([${width + wallThickness * 2}, ${depth + wallThickness * 2}, ${height + wallThickness * 2}]);

    // Inner cavity
    translate([${wallThickness}, ${wallThickness}, ${wallThickness}])
      cube([${width}, ${depth}, ${height}]);

    ${ventHoles ? `
    // Ventilation holes
    for(x=[10:20:${width}]) {
      for(y=[10:20:${depth}]) {
        translate([x, y, 0])
          cylinder(h=${wallThickness}, d=5);
      }
    }` : ''}

    // Port cutouts
    translate([${wallThickness}, -1, ${wallThickness + 5}])
      cube([20, ${wallThickness + 2}, 10]); // USB-C power

    translate([${width - 20}, -1, ${wallThickness + 5}])
      cube([20, ${wallThickness + 2}, 10]); // Ethernet
  }
}

// Mounting features
${requirements.mountType === 'wall' ? `
module wallMount() {
  translate([${width/2}, ${depth + wallThickness * 2}, 0])
    difference() {
      cube([30, 20, ${height + wallThickness * 2}]);
      translate([15, 10, ${height/2}])
        rotate([90, 0, 0])
          cylinder(h=20, d=5);
    }
}
` : ''}

// Main assembly
mainBody();
${requirements.mountType === 'wall' ? 'wallMount();' : ''}
`.trim();
}