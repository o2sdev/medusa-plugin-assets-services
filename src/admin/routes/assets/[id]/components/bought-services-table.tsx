import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Container, Heading, Button, DataTable, useDataTable, createDataTableColumnHelper, Drawer, Text, DataTableRowSelectionState, createDataTableCommandHelper } from "@medusajs/ui"
import { Plus } from "@medusajs/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDate } from "../../../../utils/format-date"
import { ServiceInstanceType, AssetType, CompatibleService } from "../../../../../modules/assets-services/types"
import { CreateServiceInstanceModal } from "../../../service-instances/components/create-service-instance-modal"
import { useServiceInstanceUnlinkAssetMutation } from "../../../../mutations/service-instance-unlink-asset"
import { useDeleteServiceInstanceMutation } from "../../../../mutations/delete-service-instance"

export const BoughtServicesTable = ({ serviceInstances, isLoading, asset }: { 
    serviceInstances: ServiceInstanceType[], 
    isLoading: boolean, 
    asset: AssetType 
}) => {
    const navigate = useNavigate()
    const [isProductSelectionOpen, setIsProductSelectionOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<CompatibleService | null>(null)
    const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})
    const queryClient = useQueryClient()
    
    const { mutateAsync: unlinkServiceMutation } = useServiceInstanceUnlinkAssetMutation({
        queryClient,
        onSuccess: () => {
            setRowSelection({})
            queryClient.invalidateQueries({ queryKey: ["asset", asset.id] })
        },
        onError: (error) => {
            console.error("Error unlinking service:", error)
        }
    })
    
    const deleteServiceInstanceMutation = useDeleteServiceInstanceMutation({
        queryClient,
        onSuccess: () => {
            setRowSelection({})
            queryClient.invalidateQueries({ queryKey: ["asset", asset.id] })
        },
        onError: (error) => {
            console.error("Error deleting service instance:", error)
        }
    })

    const commandHelper = createDataTableCommandHelper()
    const commands = [
        commandHelper.command({
            label: "Unlink",
            shortcut: "U",
            action: async (selection) => {
                const serviceIdsToUnlink = Object.keys(selection)
                for (const serviceId of serviceIdsToUnlink) {
                    await unlinkServiceMutation({ serviceInstanceId: serviceId, assetId: asset.id })
                }
                setRowSelection({})
            }
        }),
        commandHelper.command({
            label: "Delete",
            shortcut: "D",
            action: async (selection) => {
                const serviceIdsToDelete = Object.keys(selection)
                for (const serviceId of serviceIdsToDelete) {
                    await deleteServiceInstanceMutation.mutate(serviceId)
                }
                setRowSelection({})
            }
        })
    ]

    const { data: compatibleServices, isLoading: isLoadingCompatibleServices } = useQuery<CompatibleService[]>({
        queryKey: ["compatible-services", asset.id],
        queryFn: () => fetch(`/admin/assets/${asset.id}/compatible-services`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to fetch compatible services")
                return res.json()
            })
            .then(data => {
                // Filter out services that are already assigned to this asset
                const services = data.compatibleServices || []
                
                // Only keep services that don't already exist
                return services.filter((service: CompatibleService) => {
                    // For each service, check if it's already assigned
                    const alreadyAssigned = serviceInstances?.some((instance: any) => {
                        return instance.product_variant?.id === service.product?.id;
                    });
                    
                    // Keep only services that are not already assigned
                    return !alreadyAssigned;
                });
            }),
        enabled: isProductSelectionOpen
    })

    const columnHelper = createDataTableColumnHelper<ServiceInstanceType>()

    const columns = [
        columnHelper.accessor("name", {
            header: "Name",
        }),
        columnHelper.accessor("start_date", {
            header: "Start date",
            cell: ({ getValue }) => {
                return formatDate(getValue())
            }
        }),
        columnHelper.accessor("end_date", {
            header: "End date",
            cell: ({ getValue }) => {
                return formatDate(getValue())
            }
        }),
        columnHelper.accessor("payment_type", {
            header: "Payment type",
        }),
        columnHelper.accessor("status", {
            header: "Status",
        }),
    ]

    const table = useDataTable({
        columns: [
            columnHelper.select(),
            ...columns,
        ],
        data: serviceInstances || [],
        getRowId: (row) => row.id,
        rowCount: serviceInstances?.length || 0,
        isLoading: isLoading,
        onRowClick: (event, row) => {
            navigate(`/service-instances/${row.id}`)
        },
        commands,
        rowSelection: {
            state: rowSelection,
            onRowSelectionChange: setRowSelection,
        }
    })

    const handleSelectProduct = (product: CompatibleService) => {
        setSelectedProduct(product)
        setIsProductSelectionOpen(false)
        setIsCreateModalOpen(true)
    }

    return (
        <Container>
            <div className="flex items-center justify-between pb-4">
                <Heading level="h2">Bought services</Heading>
                <Button variant="secondary" size="small" onClick={() => setIsProductSelectionOpen(true)}>
                    <Plus className="mr-2" />
                    Assign Service
                </Button>
            </div>
            <DataTable instance={table}>
                <DataTable.Table />
                <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
            </DataTable>

            {/* Product Selection Modal */}
            <Drawer open={isProductSelectionOpen} onOpenChange={setIsProductSelectionOpen}>
                <Drawer.Content>
                    <Drawer.Header>
                        <Drawer.Title>Select Service</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                        <div className="mb-4 p-3 bg-ui-bg-subtle border border-ui-border-base rounded-rounded">
                            <Text className="text-ui-fg-subtle text-sm">
                                Compatible services can be managed on product variant page by creating a product reference.
                            </Text>
                        </div>
                        {isLoadingCompatibleServices ? (
                            <Text>Loading compatible services...</Text>
                        ) : compatibleServices && compatibleServices.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {compatibleServices.map((service: CompatibleService) => (
                                    <div 
                                        key={service.id} 
                                        className="border p-4 rounded cursor-pointer transition-all duration-200 hover:bg-ui-bg-subtle hover:border-ui-border-base"
                                        onClick={() => handleSelectProduct(service)}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            {service.product?.thumbnail && (
                                                <img 
                                                    src={service.product.thumbnail} 
                                                    alt={service.product?.title || service.title}
                                                    className="w-10 h-10 object-cover rounded"
                                                />
                                            )}
                                            <div>
                                                <Text className="font-medium">{service.product?.title || service.title}</Text>
                                                <Text className="text-xs text-ui-fg-subtle">Variant: {service.title} ({service.sku})</Text>
                                            </div>
                                        </div>
                                        {service.product?.description && (
                                            <Text className="text-ui-fg-subtle text-sm mt-2">{service.product.description}</Text>
                                        )}
                                        {service.prices && service.prices.length > 0 && (
                                            <div className="mt-2">
                                                <Text className="text-sm font-medium">
                                                    {service.prices[0].amount} {service.prices[0].currency_code.toUpperCase()}
                                                </Text>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Text>No compatible services found for this asset</Text>
                        )}
                    </Drawer.Body>
                </Drawer.Content>
            </Drawer>

            {/* Service Instance Creation Modal */}
            {isCreateModalOpen && (
                <CreateServiceInstanceModal 
                    open={isCreateModalOpen} 
                    setOpen={setIsCreateModalOpen} 
                    preselectedProduct={selectedProduct}
                    preselectedCustomer={{
                        id: asset.customer.id,
                        email: asset.customer.email,
                        first_name: asset.customer.first_name || undefined,
                        last_name: asset.customer.last_name || undefined
                    }}
                    assetId={asset.id}
                />
            )}
        </Container>
    )
} 
