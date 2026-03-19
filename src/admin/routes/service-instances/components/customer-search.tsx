import { Button, Input } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"
import { useState } from "react"
import { CustomerType, CustomerSearchResultType } from "../../../../modules/assets-services/types"

interface CustomerSearchProps {
  selectedCustomer: CustomerType | null
  onCustomerSelect: (customer: CustomerType) => void
  onCustomerClear: () => void
  disabled?: boolean
}

export const CustomerSearch = ({
  selectedCustomer,
  onCustomerSelect,
  onCustomerClear,
  disabled = false
}: CustomerSearchProps) => {
  const [customerSearchQuery, setCustomerSearchQuery] = useState("")
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false)
  const [customerSearchResults, setCustomerSearchResults] = useState<CustomerSearchResultType | null>(null)

  // Customer search function
  const searchCustomers = async () => {
    if (!customerSearchQuery.trim()) return

    setIsSearchingCustomers(true)
    try {
      const data = await sdk.client.fetch(`/admin/customers?q=${encodeURIComponent(customerSearchQuery)}`)
      setCustomerSearchResults(data)
    } catch (error) {
      console.error("Error searching customers:", error)
    } finally {
      setIsSearchingCustomers(false)
    }
  }

  const handleCustomerSelect = (customer: CustomerType) => {
    onCustomerSelect(customer)
    setCustomerSearchQuery("")
    setCustomerSearchResults(null)
  }

  return (
    <div>
      <label className="text-ui-fg-subtle mb-2 block text-sm">Customer</label>
      {selectedCustomer ? (
        <div className="flex items-center justify-between border border-ui-border-base rounded-rounded p-2">
          <div>
            <div className="font-medium">{selectedCustomer.email}</div>
            {(selectedCustomer.first_name || selectedCustomer.last_name) && (
              <div className="text-xs text-ui-fg-subtle">
                {[selectedCustomer.first_name, selectedCustomer.last_name].filter(Boolean).join(" ")}
              </div>
            )}
          </div>
          {!disabled && (
            <Button
              variant="secondary"
              size="small"
              onClick={onCustomerClear}
            >
              Change
            </Button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Search for a customer"
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && customerSearchQuery.trim()) {
                  e.preventDefault()
                  searchCustomers()
                }
              }}
              disabled={disabled}
            />
            <Button
              variant="secondary"
              onClick={searchCustomers}
              disabled={isSearchingCustomers || !customerSearchQuery.trim() || disabled}
            >
              {isSearchingCustomers ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {customerSearchResults && customerSearchResults.customers && customerSearchResults.count > 0 && (
            <div className="border border-ui-border-base rounded-rounded overflow-y-auto max-h-40">
              <div className="divide-y">
                {customerSearchResults.customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-2 cursor-pointer hover:bg-ui-bg-base-hover"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div>
                      <div className="font-medium">{customer.email}</div>
                      {(customer.first_name || customer.last_name) && (
                        <div className="text-xs text-ui-fg-subtle">
                          {[customer.first_name, customer.last_name].filter(Boolean).join(" ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {customerSearchQuery && !isSearchingCustomers && customerSearchResults && customerSearchResults.count === 0 && (
            <div className="py-2 text-center text-ui-fg-subtle">No customers found</div>
          )}
        </div>
      )}
    </div>
  )
} 