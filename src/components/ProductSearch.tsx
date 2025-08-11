
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ProductSpecifications {
  [key: string]: string | number | boolean;
}

interface ReferenceStandards {
  [key: string]: string | number | boolean;
}

interface ProductModel {
  id: string;
  name: string;
  model_number: string;
  specifications: ProductSpecifications;
  reference_standards: ReferenceStandards;
}

interface ProductSearchProps {
  onProductSelect: (product: ProductModel | null) => void;
  onReferenceSelect: (product: ProductModel | null) => void;
  selectedProduct: ProductModel | null;
  selectedReference: ProductModel | null;
}

const ProductSearch: React.FC<ProductSearchProps> = ({ 
  onProductSelect, 
  onReferenceSelect, 
  selectedProduct, 
  selectedReference 
}) => {
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<ProductModel[]>([]);
  const [openProduct, setOpenProduct] = useState(false);
  const [openReference, setOpenReference] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.model_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('product_models')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product: ProductModel) => {
    onProductSelect(product);
    setOpenProduct(false);
  };

  const handleReferenceSelect = (product: ProductModel) => {
    onReferenceSelect(product);
    setOpenReference(false);
  };

  if (loading) {
    return (
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Search className="h-5 w-5 text-orange-600" />
          Product Model Selection
        </CardTitle>
        <CardDescription>
          Search and select product models for report generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Product Search */}
        <div className="space-y-2">
          <Label htmlFor="product-search" className="text-sm font-medium text-gray-700">
            Primary Product Model *
          </Label>
          <div className="relative">
            <Input
              id="product-search"
              placeholder="Type to search for product models..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-gray-200 focus:border-orange-500 focus:ring-orange-500/20"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Product Selection Dropdown */}
          <Popover open={openProduct} onOpenChange={setOpenProduct}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openProduct}
                className="w-full justify-between"
              >
                {selectedProduct ? (
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{selectedProduct.name}</span>
                    <span className="text-sm text-gray-500">({selectedProduct.model_number})</span>
                  </span>
                ) : (
                  "Select primary product model..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search product models..." />
                <CommandList>
                  <CommandEmpty>No product models found.</CommandEmpty>
                  <CommandGroup>
                    {filteredProducts.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleProductSelect(product)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedProduct?.id === product.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500">{product.model_number}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Reference Model Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Reference Product Model (Optional)
          </Label>
          <Popover open={openReference} onOpenChange={setOpenReference}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openReference}
                className="w-full justify-between"
              >
                {selectedReference ? (
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{selectedReference.name}</span>
                    <span className="text-sm text-gray-500">({selectedReference.model_number})</span>
                  </span>
                ) : (
                  "Select reference model..."
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search reference models..." />
                <CommandList>
                  <CommandEmpty>No reference models found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem onSelect={() => handleReferenceSelect(null)}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          !selectedReference ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="text-gray-500 italic">No reference model</span>
                    </CommandItem>
                    {products.map((product) => (
                      <CommandItem
                        key={product.id}
                        onSelect={() => handleReferenceSelect(product)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedReference?.id === product.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500">{product.model_number}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Selected Products Info */}
        {selectedProduct && (
          <div className="p-4 bg-blue-50 rounded-lg border">
            <h4 className="font-medium text-blue-900 mb-2">Selected Product Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Model:</strong> {selectedProduct.model_number}</div>
              <div><strong>Name:</strong> {selectedProduct.name}</div>
              {selectedProduct.specifications && Object.entries(selectedProduct.specifications).map(([key, value]) => (
                <div key={key}><strong>{key}:</strong> {value as string}</div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductSearch;
