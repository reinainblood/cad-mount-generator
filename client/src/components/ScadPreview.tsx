import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateScad } from "@/lib/scad-generator";

interface ScadPreviewProps {
  code: string;
  productData: any;
  mountingRequirements: any;
  onScadGenerated: (code: string) => void;
}

export default function ScadPreview({
  code,
  productData,
  mountingRequirements,
  onScadGenerated
}: ScadPreviewProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generatePreview();
  }, [productData, mountingRequirements]);

  const generatePreview = async () => {
    setLoading(true);
    try {
      const generatedCode = await generateScad(productData, mountingRequirements);
      onScadGenerated(generatedCode);
    } catch (error) {
      console.error("Failed to generate SCAD:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mount.scad';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">OpenSCAD Preview</h3>
        <Button onClick={handleExport} disabled={!code || loading}>
          Export SCAD
        </Button>
      </div>
      
      <Textarea
        value={code}
        readOnly
        className="font-mono h-[300px]"
        placeholder={loading ? "Generating..." : "SCAD code will appear here"}
      />
    </div>
  );
}
