import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Heading, Button, Label, Input, DropdownMenu, createDataTableColumnHelper, useDataTable, DataTable, DataTableRowSelectionState } from "@medusajs/ui"
import { Container } from "@medusajs/ui"
import { AssetType } from "../../../../../modules/assets-services/types"
import { formatDate } from "../../../../utils/format-date"
import { useAssets } from "../hooks/use-assets"
import { useAssetCommands } from "../hooks/use-asset-commands"

export const AssetsTableWidget = ({ assets, isLoading }: { assets: AssetType[], isLoading: boolean }) => {
    const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})
    const { id: serviceInstanceId } = useParams()
    const navigate = useNavigate()
    
    const {
        searchResults,
        searchAssets,
        assetSearchQuery,
        setAssetSearchQuery,
        isSearching,
        handleAssetLinkage,
        deleteAssetMutation,
        unlinkAssetMutation
    } = useAssets(serviceInstanceId)

    const commands = useAssetCommands(
        serviceInstanceId,
        deleteAssetMutation,
        unlinkAssetMutation,
        setRowSelection
    )

    const columnHelper = createDataTableColumnHelper<AssetType>()
    
    const columns = [
        columnHelper.accessor("name", {
            header: "Name",
        }),
        columnHelper.accessor("serial_number", {
            header: "Serial number",
        }),
        columnHelper.accessor("end_of_warranty_date", {
            header: "End of warranty",
            cell: ({ getValue }) => {
                return formatDate(getValue())
            }
        }),
    ]

    const table = useDataTable({
        columns: [
            columnHelper.select(),
            ...columns,
        ],
        data: assets,
        getRowId: (row) => row.id,
        rowCount: assets?.length || 0,
        isLoading,
        onRowClick: (event, row) => {
            navigate(`/assets/${row.id}`)
        },
        commands,
        rowSelection: {
            state: rowSelection,
            onRowSelectionChange: setRowSelection,
        }
    })

    return (
        <Container>
            <DataTable instance={table}>
                <DataTable.Toolbar className="flex items-center justify-between">
                    <Heading level="h2">Assets</Heading>
                    <DropdownMenu>
                        <DropdownMenu.Trigger asChild>
                            <Button>Add Asset</Button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end" className="w-80">
                            <div className="p-2">
                                <div className="mb-2">
                                    <Label htmlFor="asset-search">Select Asset</Label>
                                    <div className="flex gap-2">
                                        <Input 
                                            id="asset-search"
                                            placeholder="Enter asset name" 
                                            value={assetSearchQuery}
                                            onChange={(e) => setAssetSearchQuery(e.target.value)}
                                            className="flex-1"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && assetSearchQuery.trim()) {
                                                    e.preventDefault();
                                                    searchAssets();
                                                }
                                            }}
                                        />
                                        <Button 
                                            variant="secondary" 
                                            onClick={() => searchAssets()}
                                            disabled={isSearching || !assetSearchQuery.trim()}
                                        >
                                            {isSearching ? 'Searching...' : 'Search'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto">
                                    {searchResults?.assets?.length > 0 ? (
                                        <div className="divide-y">
                                            {searchResults.assets.map((asset: AssetType) => (
                                                <DropdownMenu.Item 
                                                    key={asset.id}
                                                    className="flex items-center justify-between py-2 cursor-pointer"
                                                    onSelect={() => {
                                                        handleAssetLinkage(asset.id)
                                                        setAssetSearchQuery("")
                                                    }}
                                                >
                                                    <div>
                                                        <div className="font-medium">{asset.name}</div>
                                                        {asset.serial_number && (
                                                            <div className="text-xs text-ui-fg-subtle">SN: {asset.serial_number}</div>
                                                        )}
                                                    </div>
                                                </DropdownMenu.Item>
                                            ))}
                                        </div>
                                    ) : assetSearchQuery && !isSearching && searchResults ? (
                                        <div className="py-2 text-center text-ui-fg-subtle">No assets found</div>
                                    ) : null}
                                </div>
                            </div>
                        </DropdownMenu.Content>
                    </DropdownMenu>
                </DataTable.Toolbar>
                <DataTable.Table />
                <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
            </DataTable>
        </Container>
    )
} 