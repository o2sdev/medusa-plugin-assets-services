import { Container } from "@medusajs/ui"
import { AssetType } from "../../../../../modules/assets-services/types"
import { SectionRow } from "../../../../components/section-row"
import { formatDate } from "../../../../utils/format-date"
import { useNavigate } from "react-router-dom"

export const AssetDetails = ({ asset }: { asset: AssetType }) => {
    const navigate = useNavigate()
    
    const navigateToProductVariant = () => {
        if (asset.product_variant) {
            navigate(`/products/${asset.product_variant.product_id}/variants/${asset.product_variant.id}`)
        }
    }
    
    return (
        <Container className="px-0 py-0">
            <div className="flex flex-col">
                <div className="divide-y">
                    {asset.thumbnail && (
                        <SectionRow 
                            title="Image" 
                            value={asset.thumbnail} 
                            isImage={true}
                            imageAlt={asset.name || "Asset image"}
                        />
                    )}
                    <SectionRow title="Name" value={asset.name} />
                    <SectionRow title="Serial number" value={asset.serial_number} />
                    <SectionRow title="End of warranty date" value={formatDate(asset.end_of_warranty_date)} />
                </div>
                
                {asset.product_variant && (
                    <>
                        <h3 className="text-ui-fg-subtle font-medium border border-ui-border-base p-4">Assigned product variant information</h3>
                        <div className="divide-y">
                            <SectionRow title="Product" value={asset.product_variant?.product?.title} onClick={navigateToProductVariant} />
                            <SectionRow title="Description" value={asset.product_variant.product?.description} onClick={navigateToProductVariant} />
                            <SectionRow title="Variant name" value={asset.product_variant?.title} onClick={navigateToProductVariant} />
                            <SectionRow title="Product variant" value={asset.product_variant.sku} onClick={navigateToProductVariant} />
                        </div>
                    </>
                )}
            </div>
        </Container>
    )
} 