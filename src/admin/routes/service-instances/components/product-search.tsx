import { Button, Input } from "@medusajs/ui"
import { useState } from "react"
import { ProductSearchResultType } from "../../../../modules/assets-services/types"
import { ProductVariantDTO } from "@medusajs/framework/types"

interface ProductSearchProps {
  selectedProduct: ProductVariantDTO | null
  onProductSelect: (product: ProductVariantDTO) => void
  onProductClear: () => void
  disabled?: boolean
}

export const ProductSearch = ({
  selectedProduct,
  onProductSelect,
  onProductClear,
  disabled = false
}: ProductSearchProps) => {
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResultType | null>(null)

  // Product search function
  const searchProducts = async () => {
    if (!productSearchQuery.trim()) return

    setIsSearchingProducts(true)
    try {
      const response = await fetch(`/admin/product-variants?q=${encodeURIComponent(productSearchQuery)}`)
      const data = await response.json()
      setProductSearchResults(data)
    } catch (error) {
      console.error("Error searching products:", error)
    } finally {
      setIsSearchingProducts(false)
    }
  }

  const handleProductSelect = (product: ProductVariantDTO) => {
    onProductSelect(product)
    setProductSearchQuery("")
    setProductSearchResults(null)
  }

  return (
    <div>
      <label className="text-ui-fg-subtle mb-2 block text-sm">Product</label>
      {selectedProduct ? (
        <div className="flex items-center justify-between border border-ui-border-base rounded-rounded p-2">
          <div className="font-medium">{selectedProduct?.product?.title} - {selectedProduct.title} ({selectedProduct.sku})</div>
          {!disabled && (
            <Button
              variant="secondary"
              size="small"
              onClick={onProductClear}
            >
              Change
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Search for a product"
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && productSearchQuery.trim()) {
                  e.preventDefault()
                  searchProducts()
                }
              }}
              disabled={disabled}
            />
            <Button
              variant="secondary"
              onClick={searchProducts}
              disabled={isSearchingProducts || !productSearchQuery.trim() || disabled}
            >
              {isSearchingProducts ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {productSearchResults && productSearchResults.variants && productSearchResults.count > 0 && (
            <div className="border border-ui-border-base rounded-rounded overflow-y-auto max-h-40">
              <div className="divide-y">
                {productSearchResults.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-ui-bg-base-hover"
                    onClick={() => handleProductSelect(variant)}
                  >
                    <div>
                      <div className="font-medium">{variant?.product?.title} - {variant.title} ({variant.sku})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {productSearchQuery && !isSearchingProducts && productSearchResults && productSearchResults.count === 0 && (
            <div className="py-2 text-center text-ui-fg-subtle">No variants found</div>
          )}
        </div>
      )}
    </div>
  )
} 