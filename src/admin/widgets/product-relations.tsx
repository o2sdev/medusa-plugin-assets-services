import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProductVariant } from "@medusajs/framework/types"
import {
  Container,
  Heading,
  Text,
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
  Button,
  Select,
  usePrompt,
  createDataTableCommandHelper,
  DataTableRowSelectionState,
  Input
} from "@medusajs/ui"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useRef, useEffect, useCallback } from "react"
import { SingleColumnLayout } from "../layouts/single-column"
import { ProductSearchResultType, ProductReferenceType, ProductReferencesResponseType, ProductReferenceTypeEnum } from "../../modules/assets-services/types"

const ProductRelationsWidget = ({ data: productVariant }: DetailWidgetProps<AdminProductVariant>) => {
  const productId = productVariant.product_id
  const variantId = productVariant.id
  const [selectedVariant, setSelectedVariant] = useState<string>("")
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string>("")
  const [selectedReferenceType, setSelectedReferenceType] = useState<string>("")
  const [isAddingReference, setIsAddingReference] = useState(false)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [isSearchingProducts, setIsSearchingProducts] = useState(false)
  const [productSearchResults, setProductSearchResults] = useState<ProductSearchResultType | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const resultsContainerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})

  const { data: referencesData, isLoading } = useQuery<ProductReferencesResponseType>({
    queryFn: () => fetch(`/admin/products/${productId}/variants/${variantId}/references`, { credentials: "include" }).then(res => res.json()),
    queryKey: [["product", productId, "variant", variantId, "references"]],
  })

  const searchProducts = async (resetPage = true) => {
    const currentPage = resetPage ? 1 : page
    if (resetPage) {
      setPage(1)
      setProductSearchResults(null)
    }

    setIsSearchingProducts(true)
    try {
      const queryParams = new URLSearchParams({
        limit: "10",
        offset: ((currentPage - 1) * 10).toString()
      })
      
      if (productSearchQuery.trim()) {
        queryParams.append("q", productSearchQuery)
      }
      
      const response = await fetch(`/admin/product-variants?${queryParams.toString()}`, { credentials: "include" })
      const data = await response.json()
      
      // Filter out current variant and already referenced variants
      if (data.variants) {
        // Transform the variants data to ensure it has the fields we need
        const filteredVariants = data.variants
          .filter((variant: any) => {
            const isCurrentVariant = variant.id === variantId
            return !isCurrentVariant
          })
          .map((variant: any) => ({
            id: variant.id,
            title: variant.title,
            sku: variant.sku,
            // Use product.title if available, otherwise empty string
            product_title: variant.product?.title || ''
          }))
        
        setProductSearchResults(prev => {
          if (prev && !resetPage) {
            // Create a map of existing variant IDs for O(1) lookup
            const existingVariantIds = new Set(prev.variants.map((v: any) => v.id))
            
            // Only add variants that don't already exist in the list
            const uniqueNewVariants = filteredVariants.filter((v: any) => !existingVariantIds.has(v.id))
            
            return {
              ...data,
              variants: [...prev.variants, ...uniqueNewVariants],
              count: data.count
            }
          }
          return {
            ...data,
            variants: filteredVariants,
            count: data.count
          }
        })
        
        setHasMore(currentPage * 10 < data.count)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error("Error searching products:", error)
      prompt({
        title: "Error searching products",
        description: "Failed to search for products",
      })
    } finally {
      setIsSearchingProducts(false)
    }
  }

  // Load initial products when adding reference is opened
  useEffect(() => {
    if (isAddingReference) {
      searchProducts()
    }
  }, [isAddingReference])
  
  // Handle infinite scroll
  const handleScroll = useCallback(() => {
    if (!resultsContainerRef.current) return

    const { scrollTop, scrollHeight, clientHeight } = resultsContainerRef.current
    
    if (scrollTop + clientHeight >= scrollHeight - 20 && hasMore && !isSearchingProducts) {
      setPage(prev => prev + 1)
      searchProducts(false)
    }
  }, [hasMore, isSearchingProducts])

  useEffect(() => {
    const currentRef = resultsContainerRef.current
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll)
      return () => currentRef.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll])

  const handleProductSelect = (variant: any) => {
    setSelectedVariant(variant.id)
    setSelectedVariantLabel(`${variant.product_title || ''} - ${variant.title} ${variant.sku ? `(${variant.sku})` : ''}`)
    setProductSearchQuery("")
    setProductSearchResults(null)
  }

  const clearSelectedProduct = () => {
    setSelectedVariant("")
    setSelectedVariantLabel("")
  }

  const addReferenceMutation = useMutation({
    mutationFn: async ({ targetVariantId, referenceType }: { targetVariantId: string, referenceType: string }) => {
      const response = await fetch(`/admin/products/${productId}/variants/${variantId}/references`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetProducts: [targetVariantId],
          referenceType: referenceType,
        }),
      })

      if (response.status === 304) {
        prompt({
          title: "Error adding reference",
          description: "Product reference already exist",
        })
        return
      }

      if (!response.ok) {
        throw new Error("Failed to add reference")
      }

      return response.json()
    },
    onSuccess: () => {
      setSelectedVariant("")
      setSelectedVariantLabel("")
      setSelectedReferenceType("")
      queryClient.invalidateQueries({
        queryKey: [["product", productId, "variant", variantId, "references"]],
      })
    },
    onError: (error) => {
      prompt({
        title: "Error adding reference",
        description: error.message,
      })
    }
  })

  const deleteReferenceMutation = useMutation({
    mutationFn: async (targetVariantId: string) => {
      const response = await fetch(
        `/admin/products/references/${targetVariantId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      )

      if (!response.ok) {
        throw new Error("Failed to delete reference")
      }

      return response.json()
    },
    onSuccess: () => {
      setRowSelection({})

      queryClient.invalidateQueries({
        queryKey: [["product", productId, "variant", variantId, "references"]],
      })
    },
    onError: (error) => {
      prompt({
        title: "Error deleting reference",
        description: error.message,
      })
    }
  })

  const handleAddReference = () => {
    if (!selectedVariant) {
      prompt({
        title: "Error adding reference",
        description: "Please select a variant to add as reference",
      })
      return
    }
    if (!selectedReferenceType) {
      prompt({
        title: "Error adding reference",
        description: "Please select a reference type",
      })
      return
    }

    addReferenceMutation.mutate({ targetVariantId: selectedVariant, referenceType: selectedReferenceType })
  }

  const columnHelper = createDataTableColumnHelper<ProductReferenceType>()
  const commandHelper = createDataTableCommandHelper()

  const useCommands = (
    deleteMutation: typeof deleteReferenceMutation, 
    selectionSetter: React.Dispatch<React.SetStateAction<DataTableRowSelectionState>>
  ) => {
    return [
      commandHelper.command({
        label: "Delete",
        shortcut: "D",
        action: async (selection) => {
          const referencesToDeleteIds = Object.keys(selection)
          for (const targetVariantId of referencesToDeleteIds) {
            await deleteMutation.mutate(targetVariantId)
          }
          selectionSetter({})
        }
      })
    ]
  }

  const commands = useCommands(deleteReferenceMutation, setRowSelection)

  const columns = [
    columnHelper.accessor("targetProduct.product.title", {
      header: "Product name",
    }),
    columnHelper.accessor("targetProduct.title", {
      header: "Variant name",
    }),
    columnHelper.accessor("targetProduct.sku", {
      header: "SKU",
    }),
    columnHelper.accessor("reference_type", {
      header: "Reference type",
      cell: ({ row }) => {
        return ProductReferenceTypeEnum[row.original.reference_type as keyof typeof ProductReferenceTypeEnum]
      }
    }),
  ]

  columnHelper.display({
    id: "actions",
    cell: ({ row }) => (
      <button
        onClick={() => deleteReferenceMutation.mutate(row.original.id)}
        className="text-red-500 hover:text-red-700"
      >
        Delete
      </button>
    )
  })

  const table = useDataTable({
    columns: [
      columnHelper.select(),
      ...columns,
    ],
    data: referencesData?.productReferences || [],
    getRowId: (row) => row.id,
    rowCount: referencesData?.productReferences?.length || 0,
    isLoading,
    commands,
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection,
    },
  })

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Product References</Heading>
      </div>

      <div className="px-6 py-4">
        <Button 
          variant="secondary" 
          className="w-full flex justify-between items-center mb-4"
          onClick={() => setIsAddingReference(!isAddingReference)}
        >
          <span>Add new reference</span>
          <span className="text-ui-fg-subtle">{isAddingReference ? "Hide" : "Show"}</span>
        </Button>
        
        {isAddingReference && (
          <div className="mt-4 border border-ui-border-base rounded-lg p-4">
            <div className="mb-4">
              <Heading level="h3">Add new reference</Heading>
              <Text className="text-ui-fg-subtle mt-1">Link this product variant to another product variant in a relation of selected type</Text>
            </div>
            <div className="flex flex-col gap-6">
              <div className="space-y-4">
                <div>
                  <Text className="mb-2 font-medium">Product Variant</Text>
                  {selectedVariant ? (
                    <div className="flex items-center justify-between border border-ui-border-base rounded-rounded p-2">
                      <div className="font-medium">{selectedVariantLabel}</div>
                      <Button
                        variant="secondary"
                        size="small"
                        onClick={clearSelectedProduct}
                        disabled={addReferenceMutation.isPending}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Search for a product variant"
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              searchProducts()
                            }
                          }}
                          disabled={isSearchingProducts || addReferenceMutation.isPending}
                        />
                        <Button
                          variant="secondary"
                          onClick={() => searchProducts()}
                          disabled={isSearchingProducts || addReferenceMutation.isPending}
                        >
                          {isSearchingProducts ? 'Searching...' : 'Search'}
                        </Button>
                      </div>
                      {productSearchResults && productSearchResults.variants && (
                        <div 
                          ref={resultsContainerRef}
                          className="border border-ui-border-base rounded-rounded overflow-y-auto max-h-40"
                        >
                          <div className="divide-y">
                            {productSearchResults.variants.map((variant) => (
                              <div
                                key={variant.id}
                                className="flex items-center justify-between p-2 cursor-pointer hover:bg-ui-bg-base-hover"
                                onClick={() => handleProductSelect(variant)}
                              >
                                <div>
                                  <div className="font-medium">{variant.product_title || ''} - {variant.title}</div>
                                  {variant.sku && (
                                    <div className="text-xs text-ui-fg-subtle">SKU: {variant.sku}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isSearchingProducts && page > 1 && (
                              <div className="p-2 text-center text-ui-fg-subtle">Loading more variants...</div>
                            )}
                          </div>
                        </div>
                      )}
                      {productSearchResults && productSearchResults.count === 0 && (
                        <div className="py-2 text-center text-ui-fg-subtle">No variants found</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Text className="mb-2 font-medium">Reference Type</Text>
                  <Select
                    value={selectedReferenceType}
                    onValueChange={setSelectedReferenceType}
                    disabled={addReferenceMutation.isPending}
                  >
                    <Select.Trigger className="w-full">
                      <Select.Value placeholder="Select a reference type" />
                    </Select.Trigger>
                    <Select.Content>
                      {Object.entries(ProductReferenceTypeEnum).map(([key, value]) => (
                        <Select.Item key={key} value={key}>
                          {value}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleAddReference}
                  isLoading={addReferenceMutation.isPending}
                  disabled={!selectedVariant || !selectedReferenceType || addReferenceMutation.isPending}
                  className="min-w-[120px]"
                >
                  Add Reference
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4">
        {isLoading ? (
          <Text>Loading references...</Text>
        ) : referencesData?.productReferences.length === 0 ? (
          <Text className="text-ui-fg-subtle">Product has no references</Text>
        ) : (
          <SingleColumnLayout>
            <DataTable instance={table}>
              <DataTable.Table />
              <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
            </DataTable>
          </SingleColumnLayout>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product_variant.details.after",
})

export default ProductRelationsWidget