import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { parseAmazonUrl } from "@/lib/amazon-parser";

interface ProductFormProps {
  onProductData: (data: any) => void;
}

export default function ProductForm({ onProductData }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const productData = await parseAmazonUrl(data.url);
      onProductData(productData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse Amazon product URL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Amazon Product URL</Label>
          <Input
            id="url"
            placeholder="https://amazon.com/..."
            {...form.register("url", { required: true })}
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Parse Product"}
        </Button>
      </div>
    </form>
  );
}
