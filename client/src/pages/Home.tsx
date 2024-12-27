import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductForm from "@/components/ProductForm";
import MountingQuestionnaire from "@/components/MountingQuestionnaire";
import ThreePreview from "@/components/ThreePreview";
import ScadPreview from "@/components/ScadPreview";

export default function Home() {
  const [productData, setProductData] = useState<any>(null);
  const [mountingRequirements, setMountingRequirements] = useState<any>(null);
  const [scadCode, setScadCode] = useState<string>("");

  return (
    <div className="container mx-auto p-6 min-h-screen">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
        3D Mount Generator
      </h1>
      
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <ProductForm onProductData={setProductData} />
          </CardContent>
        </Card>

        {productData && (
          <Card>
            <CardContent className="p-6">
              <MountingQuestionnaire 
                productData={productData}
                onRequirementsComplete={setMountingRequirements}
              />
            </CardContent>
          </Card>
        )}

        {mountingRequirements && (
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="preview">
                <TabsList className="mb-4">
                  <TabsTrigger value="preview">3D Preview</TabsTrigger>
                  <TabsTrigger value="scad">SCAD Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="preview">
                  <ThreePreview scadCode={scadCode} />
                </TabsContent>
                <TabsContent value="scad">
                  <ScadPreview 
                    code={scadCode}
                    productData={productData}
                    mountingRequirements={mountingRequirements}
                    onScadGenerated={setScadCode}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
