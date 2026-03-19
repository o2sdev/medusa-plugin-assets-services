import { Button, DatePicker, FocusModal, Input, Select, usePrompt } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"
import { useState, useEffect } from "react"
import { CustomerType, PaymentTypeEnum } from "../../../../modules/assets-services/types"
import { useQueryClient } from "@tanstack/react-query"
import { CustomerSearch } from "./customer-search"
import { ProductSearch } from "./product-search"
import { ProductVariantDTO } from "@medusajs/framework/types"
interface Region {
  id: string
  name: string
  currency_code: string
}

interface CreateServiceInstanceModalProps {
  open: boolean
  setOpen: (open: boolean) => void
  preselectedProduct?: ProductVariantDTO | null
  preselectedCustomer?: CustomerType | null
  assetId?: string
}

export const CreateServiceInstanceModal = ({ 
  open, 
  setOpen, 
  preselectedProduct = null, 
  preselectedCustomer = null,
  assetId = undefined
}: CreateServiceInstanceModalProps) => {
  // Form state
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [paymentType, setPaymentType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const prompt = usePrompt()

  // Region state
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)

  // Selected entities state
  const [selectedProduct, setSelectedProduct] = useState<ProductVariantDTO | null>(preselectedProduct)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(preselectedCustomer)

  // Set preselected values when they change
  useEffect(() => {
    if (preselectedProduct) {
      setSelectedProduct(preselectedProduct)
    }
    if (preselectedCustomer) {
      setSelectedCustomer(preselectedCustomer)
    }
  }, [preselectedProduct, preselectedCustomer])

  // Fetch regions when modal opens
  useEffect(() => {
    if (open) {
      fetchRegions()
    }
  }, [open])

  // Fetch regions from API
  const fetchRegions = async () => {
    setIsLoadingRegions(true)
    try {
      const data = await sdk.client.fetch("/admin/regions")
      setRegions(data.regions || [])
    } catch (error) {
      console.error("Error fetching regions:", error)
    } finally {
      setIsLoadingRegions(false)
    }
  }

  // Handle region change
  const handleRegionChange = (value: string) => {
    const region = regions.find(r => r.id === value)
    setSelectedRegion(region || null)
  }

  // Reset form
  const resetForm = () => {
    setName("")
    setStartDate(null)
    setEndDate(null)
    setPaymentType("")
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setFormError(null)
    setSelectedRegion(null)
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    setOpen(false)
  }

  // Handle submit
  const handleSubmit = async () => {
    // Validate form
    if (!name.trim()) {
      setFormError("Name is required")
      return
    }

    if (!selectedCustomer) {
      setFormError("Customer is required")
      return
    }

    if (!selectedProduct) {
      setFormError("Product is required")
      return
    }

    if (!startDate) {
      setFormError("Start date is required")
      return
    }

    if (!paymentType.trim()) {
      setFormError("Payment type is required")
      return
    }

    if (!selectedRegion) {
      setFormError("Region is required")
      return
    }

    // Format dates to ISO string for API
    const formattedStartDate = startDate ? startDate.toISOString() : null
    const formattedEndDate = endDate ? endDate.toISOString() : null

    // Prepare payload
    const payload = {
      name,
      customer_id: selectedCustomer.id,
      product_variant_id: selectedProduct.id,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      payment_type: paymentType,
      assets: assetId ? [assetId] : [],
      region_id: selectedRegion.id,
      currency_code: selectedRegion.currency_code
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await sdk.client.fetch("/admin/service-instances", {
        method: "POST",
        body: payload,
      })

      // Invalidate service instances query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["service-instances"] })
      
      // Also invalidate asset-specific queries if we're creating from an asset
      if (preselectedCustomer || assetId) {
        queryClient.invalidateQueries({ queryKey: ["asset"] })
      }

      // Close modal and reset form
      handleClose()

      // Show success message
      prompt({
        title: "Success",
        description: "Service instance created successfully",
      })
    } catch (error) {
      console.error("Error creating service instance:", error)
      setFormError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FocusModal open={open} onOpenChange={handleClose}>
      <FocusModal.Content>
        <FocusModal.Header>Create Service Instance</FocusModal.Header>
        <FocusModal.Body className="flex flex-col gap-3 px-6">
          {formError && (
            <div className="bg-ui-bg-error text-ui-fg-error p-2 rounded-rounded">
              {formError}
            </div>
          )}
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">Name</label>
            <Input
              placeholder="Enter service instance name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <CustomerSearch 
            selectedCustomer={selectedCustomer}
            onCustomerSelect={(customer) => setSelectedCustomer(customer)}
            onCustomerClear={() => setSelectedCustomer(null)}
            disabled={!!preselectedCustomer}
          />
          
          <ProductSearch 
            selectedProduct={selectedProduct}
            onProductSelect={(product) => setSelectedProduct(product)}
            onProductClear={() => setSelectedProduct(null)}
            disabled={!!preselectedProduct}
          />
          
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">Region</label>
            <Select 
              value={selectedRegion?.id} 
              onValueChange={handleRegionChange}
              disabled={isLoadingRegions}
              required
            >
              <Select.Trigger>
                <Select.Value placeholder={isLoadingRegions ? "Loading regions..." : "Select a region"} />
              </Select.Trigger>
              <Select.Content>
                {regions.map((region) => (
                  <Select.Item key={region.id} value={region.id}>
                    {region.name} ({region.currency_code})
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
          
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">Start Date</label>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              isRequired
            />
          </div>
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">End Date</label>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
            />
          </div>
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">Payment Type</label>
            <Select value={paymentType} onValueChange={setPaymentType}>
              <Select.Trigger>
                <Select.Value placeholder={`Select a payment type`} />
              </Select.Trigger>
              <Select.Content>
                {Object.entries(PaymentTypeEnum).map(([key, value]) => (
                  <Select.Item key={key} value={key}>
                    {value}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        </FocusModal.Body>
        <FocusModal.Footer>
          <div className="flex items-center gap-2 justify-end w-full">
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </FocusModal.Footer>
      </FocusModal.Content>
    </FocusModal>
  )
} 