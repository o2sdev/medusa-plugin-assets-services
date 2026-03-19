import { Button, DatePicker, FocusModal, Input, usePrompt, Select } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"
import { useState, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ProductSearch } from "../../service-instances/components/product-search"
import { CustomerSearch } from "../../service-instances/components/customer-search"
import { CustomerType, ProductVariantType } from "../../../../modules/assets-services/types"

interface Region {
  id: string
  name: string
  currency_code: string
}

interface CreateAssetModalProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export const CreateAssetModal = ({ open, setOpen }: CreateAssetModalProps) => {
  // Form state
  const [name, setName] = useState("")
  const [serialNumber, setSerialNumber] = useState("")
  const [endOfWarrantyDate, setEndOfWarrantyDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [thumbnail, setThumbnail] = useState("")
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  
  // Region state
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [isLoadingRegions, setIsLoadingRegions] = useState(false)
  
  // Address state
  const [city, setCity] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [province, setProvince] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [phone, setPhone] = useState("")
  const [address1, setAddress1] = useState("")

  // Selected entities state
  const [selectedProduct, setSelectedProduct] = useState<ProductVariantType | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null)

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

  // Reset form
  const resetForm = () => {
    setName("")
    setSerialNumber("")
    setEndOfWarrantyDate(null)
    setSelectedProduct(null)
    setSelectedCustomer(null)
    setFormError(null)
    setThumbnail("")
    setCity("")
    setCountryCode("")
    setProvince("")
    setPostalCode("")
    setPhone("")
    setAddress1("")
    setSelectedRegion(null)
  }

  // Handle close
  const handleClose = () => {
    resetForm()
    setOpen(false)
  }

  // Handle region change
  const handleRegionChange = (value: string) => {
    const region = regions.find(r => r.id === value)
    setSelectedRegion(region || null)
  }

  // Handle submit
  const handleSubmit = async () => {
    // Validate form
    if (!name.trim()) {
      setFormError("Name is required")
      return
    }

    if (!serialNumber.trim()) {
      setFormError("Serial number is required")
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
    
    if (!city.trim()) {
      setFormError("City is required")
      return
    }
    
    if (!countryCode.trim()) {
      setFormError("Country code is required")
      return
    }
    
    if (!address1.trim()) {
      setFormError("Address is required")
      return
    }

    if (!selectedRegion) {
      setFormError("Region is required")
      return
    }

    // Format date to ISO string for API
    const formattedEndOfWarrantyDate = endOfWarrantyDate ? endOfWarrantyDate.toISOString() : null

    // Prepare payload
    const payload = {
      name,
      serial_number: serialNumber,
      thumbnail,
      customer_id: selectedCustomer.id,
      product_variant_id: selectedProduct.id,
      end_of_warranty_date: formattedEndOfWarrantyDate,
      currency_code: selectedRegion.currency_code,
      region_id: selectedRegion.id,
      address: {
        city,
        country_code: countryCode,
        province,
        postal_code: postalCode,
        phone,
        address_1: address1
      }
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      await sdk.client.fetch("/admin/assets", {
        method: "POST",
        body: payload,
      })

      // Invalidate assets query to refetch the data
      queryClient.invalidateQueries({ queryKey: ["assets"] })

      // Close modal and reset form
      handleClose()

      // Show success message
      prompt({
        title: "Success",
        description: "Asset created successfully",
      })
    } catch (error) {
      console.error("Error creating asset:", error)
      setFormError(error instanceof Error ? error.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FocusModal open={open} onOpenChange={handleClose}>
      <FocusModal.Content>
        <FocusModal.Header>Create Asset</FocusModal.Header>
        <FocusModal.Body className="flex flex-col gap-3 px-6 overflow-y-auto max-h-[90vh] py-3">
          {formError && (
            <div className="bg-ui-bg-error text-ui-fg-error p-2 rounded-rounded">
              {formError}
            </div>
          )}
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">Name</label>
            <Input
              placeholder="Enter asset name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">Serial Number</label>
            <Input
              placeholder="Enter serial number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              required
            />
          </div>

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
            <label className="text-ui-fg-subtle mb-2 block text-sm">Thumbnail</label>
            <Input
              placeholder="Enter thumbnail URL"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>
          
          <CustomerSearch 
            selectedCustomer={selectedCustomer}
            onCustomerSelect={(customer) => setSelectedCustomer(customer)}
            onCustomerClear={() => setSelectedCustomer(null)}
          />
          
          <ProductSearch 
            selectedProduct={selectedProduct}
            onProductSelect={(product) => setSelectedProduct(product)}
            onProductClear={() => setSelectedProduct(null)}
          />
          
          <div>
            <label className="text-ui-fg-subtle mb-2 block text-sm">End of Warranty Date</label>
            <DatePicker
              value={endOfWarrantyDate}
              onChange={setEndOfWarrantyDate}
            />
          </div>

          <div className="mt-4">
            <h3 className="font-medium mb-2">Address Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-ui-fg-subtle mb-2 block text-sm">City</label>
                <Input
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-ui-fg-subtle mb-2 block text-sm">Street</label>
                <Input
                  placeholder="Enter street"
                  value={address1}
                  onChange={(e) => setAddress1(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-ui-fg-subtle mb-2 block text-sm">Province/State</label>
                <Input
                  placeholder="Enter province or state"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-ui-fg-subtle mb-2 block text-sm">Postal Code</label>
                <Input
                  placeholder="Enter postal code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-ui-fg-subtle mb-2 block text-sm">Country Code</label>
                <Input
                  placeholder="Enter country code (e.g. US)"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-ui-fg-subtle mb-2 block text-sm">Phone</label>
                <Input
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
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