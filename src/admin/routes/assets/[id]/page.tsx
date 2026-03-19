import { Container, Heading, IconButton, Text, usePrompt } from "@medusajs/ui"
import { sdk } from "../../../lib/sdk"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowUturnLeft, Pencil, Trash } from "@medusajs/icons"
import { TwoColumnLayout } from "../../../layouts/two-column"
import { CustomerDetailsComponent } from "../../../components/customer-details"
import { PriceDetailsComponent } from "../../../components/price-details"
import { JsonViewSection } from "../../../components/json-view-section"
import { AssetResponseType } from "../../../../modules/assets-services/types"
import { ActionMenu } from "../../../components/action-menu"
import { useDeleteAssetMutation } from "../../../mutations/delete-asset"
import { useState } from "react"
import { AssetDetails } from "./components/asset-details"
import { EditAssetDrawer } from "./components/edit-asset-drawer"
import { AddressDetails } from "./components/address-details"
import { BoughtServicesTable } from "./components/bought-services-table"

const AssetDetailsPage = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { data: response, isLoading } = useQuery<AssetResponseType>({
        queryKey: ["asset", id],
        queryFn: () => sdk.client.fetch(`/admin/assets/${id}`)
    })
    const dialog = usePrompt();
    const queryClient = useQueryClient()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const deleteAssetMutation = useDeleteAssetMutation({
        queryClient,
        onSuccess: () => {
            navigate(-1)
        },
        onError: (error) => {
            dialog({
                title: "Error deleting asset",
                description: error.message,
            })
        }
    })

    const asset = response?.asset;

    if (isLoading) {
        return (
            <Container>
                <Text>Loading asset...</Text>
            </Container>
        )
    }

    if (!asset) {
        return (
            <Container>
                <Text>Asset not found</Text>
            </Container>
        )
    }

    return (
        <>
            <Container>
                <div className="flex items-center gap-4">
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowUturnLeft />
                    </IconButton>
                    <Heading level="h2">Asset details</Heading>
                    <ActionMenu groups={[{
                        actions: [
                            {
                                icon: <Pencil />,
                                label: "Edit",
                                onClick: () => setIsDrawerOpen(true)
                            },
                            {
                                icon: <Trash />,
                                label: "Delete",
                                onClick: async () => {
                                    const userHasConfirmed = await dialog({
                                        title: "Are you sure you want to delete this asset?",
                                        description: "This action cannot be undone.",
                                        confirmText: "Delete",
                                        cancelText: "Cancel",
                                    });
                                    if (userHasConfirmed) {
                                        deleteAssetMutation.mutate(asset.id)
                                    }
                                }
                            }
                        ]
                    }]} />
                </div>
            </Container>
            <EditAssetDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} asset={asset} />
            {asset ? (
                <>
                    <TwoColumnLayout
                        firstCol={<AssetDetails asset={asset} />}
                        secondCol={
                            <>
                                <CustomerDetailsComponent customer={asset?.customer} />
                                <PriceDetailsComponent totals={asset?.totals} />
                                <AddressDetails address={asset?.address} />
                            </>
                        }
                    />
                    <BoughtServicesTable serviceInstances={asset?.service_instances} isLoading={isLoading} asset={asset} />
                    <JsonViewSection data={asset} />
                </>
            ) : (
                <Text>No asset data</Text>
            )}
        </>
    )
}

export const handle = {
    breadcrumb: () => "Asset details",
}

export default AssetDetailsPage