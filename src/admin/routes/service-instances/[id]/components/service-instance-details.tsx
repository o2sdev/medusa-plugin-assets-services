import { Container } from "@medusajs/ui"
import { ServiceInstanceType } from "../../../../../modules/assets-services/types"
import { SectionRow } from "../../../../components/section-row"
import { formatDate } from "../../../../utils/format-date"
import { useNavigate } from "react-router-dom"

export const ServiceInstanceDetails = ({ instance }: { instance: ServiceInstanceType }) => {
    const navigate = useNavigate()
    
    const navigateToProduct = () => {
        if (instance.product_variant) {
            navigate(`/products/${instance.product_variant.product_id}/variants/${instance.product_variant.id}`)
        }
    }
    
    return (
        <Container className="px-0 py-0">
            <div className="flex flex-col">
                <div className="divide-y">
                    <SectionRow title="Name" value={instance.name} />
                    <SectionRow title="Status" value={instance.status} badge={true} />
                    <SectionRow title="Payment type" value={instance.payment_type} badge={true} />
                    <SectionRow title="Start Date" value={formatDate(instance.start_date)} />
                    <SectionRow title="End Date" value={formatDate(instance.end_date)} />
                    <SectionRow title="Purchase Date" value={formatDate(instance.purchase_date)} />
                </div>
                
                {instance.product_variant && (
                    <>
                        <h3 className="text-ui-fg-subtle font-medium border border-ui-border-base p-4">Assigned product variant information</h3>
                        <div className="divide-y">
                            <SectionRow title="Product" value={instance.product_variant?.product?.title} onClick={navigateToProduct} />
                            <SectionRow title="Description" value={instance.product_variant.product?.description} onClick={navigateToProduct} />
                            <SectionRow title="Variant name" value={instance.product_variant?.title} onClick={navigateToProduct} />
                            <SectionRow title="Product variant" value={instance.product_variant.sku} onClick={navigateToProduct} />
                        </div>
                    </>
                )}
            </div>
        </Container>
    )
} 