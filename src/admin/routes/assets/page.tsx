import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, createDataTableCommandHelper, DataTablePaginationState, DataTableRowSelectionState, useDataTable, usePrompt, Heading, createDataTableColumnHelper, DataTable, Text, Button, DataTableFilteringState, Input } from "@medusajs/ui"
import { SquareTwoStack } from "@medusajs/icons"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { useMemo, useState } from "react"
import { AssetType, AssetsResponseType } from "../../../modules/assets-services/types"
import { formatDate } from "../../utils/format-date"
import { SingleColumnLayout } from "../../layouts/single-column"
import { useDeleteAssetMutation } from "../../mutations/delete-asset"
import { CreateAssetModal } from "./components/create-asset-modal"

const AssetsPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    return (
        <>
            <Container className="flex items-center justify-between mb-2">
                <Heading level="h2">Assets</Heading>
                <Button onClick={() => setIsCreateModalOpen(true)}>Create</Button>
            </Container>
            <AssetsTableWidget />
            <CreateAssetModal open={isCreateModalOpen} setOpen={setIsCreateModalOpen} />
        </>
    )
}

const AssetsTableWidget = () => {
    const navigate = useNavigate()
    const [pagination, setPagination] = useState<DataTablePaginationState>({
        pageSize: 10,
        pageIndex: 0,
    })
    const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})
    const [filtering, setFiltering] = useState<DataTableFilteringState>({})
    const [searchInput, setSearchInput] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const queryClient = useQueryClient()
    const prompt = usePrompt()
    const offset = useMemo(() => pagination.pageIndex * pagination.pageSize, [pagination])

    const { data: response, isLoading } = useQuery<AssetsResponseType>({
        queryKey: ["assets", pagination.pageSize, offset, search],
        queryFn: () => fetch(`/admin/assets?limit=${pagination.pageSize}&offset=${offset}${search ? `&q=${encodeURIComponent(search)}` : ""}`).then(res => res.json())
    })

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value)
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setSearch(searchInput)
        }
    }

    const handleSearchClick = () => {
        setSearch(searchInput)
    }


    const columnHelper = createDataTableColumnHelper<AssetType>()
    const commandHelper = createDataTableCommandHelper()

    const columns = [
        columnHelper.accessor("name", {
            header: "Name",
        }),
        columnHelper.accessor("customer.email", {
            header: "Customer",
        }),
        columnHelper.accessor("serial_number", {
            header: "Serial number",
        }),
        columnHelper.accessor("end_of_warranty_date", {
            header: "End of warranty date",
            cell: ({ getValue }) => {
                return formatDate(getValue())
            }
        }),
    ]

    const deleteAssetMutation = useDeleteAssetMutation({
        queryClient,
        onSuccess: () => {
            setRowSelection({})
        },
        onError: (error) => {
            prompt({
                title: "Error deleting asset",
                description: error.message,
            })
        }
    })
    

    const useCommands = (
        deleteMutatuin: typeof deleteAssetMutation, 
        selectionSetter: React.Dispatch<React.SetStateAction<DataTableRowSelectionState>>
      ) => {
        return [
            commandHelper.command({
                label: "Delete",
                shortcut: "D",
                action: async (selection) => {
                    const assetsToDeleteIds = Object.keys(selection)
                    for (const assetId of assetsToDeleteIds) {
                        await deleteMutatuin.mutate(assetId)
                    }
                    selectionSetter({})
                }
            })
        ]
    }

    const commands = useCommands(deleteAssetMutation, setRowSelection)

    const table = useDataTable({
        columns: [
            columnHelper.select(),
            ...columns,
        ],
        data: response?.assets || [],
        getRowId: (row) => row.id,
        rowCount: response?.count || 0,
        isLoading,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
        onRowClick: (event, row) => {
            navigate(`/assets/${row.id}`)
        },
        commands,
        rowSelection: {
            state: rowSelection,
            onRowSelectionChange: setRowSelection,
        },
    })
    return (
        <Container>
            {isLoading ? (
                <Text>Loading assets...</Text>
            ) : response?.assets?.length === 0 ? (
                <Text className="text-ui-fg-subtle">No assets found</Text>
            ) : (
                <SingleColumnLayout>
                    <DataTable instance={table}>
                    <DataTable.Toolbar className="gap-2">
                            <div className="flex items-center gap-2">
                                <div className="flex-grow">
                                    <Input
                                        placeholder="Search..."
                                        value={searchInput}
                                        onChange={handleSearchChange}
                                        onKeyDown={handleSearchKeyDown}
                                    />
                                </div>
                                <Button variant="secondary" onClick={handleSearchClick}>Search</Button>
                            </div>
                        </DataTable.Toolbar>
                        <DataTable.Table />
                        <DataTable.Pagination />
                        <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
                    </DataTable>
                </SingleColumnLayout>
            )}
        </Container>
    )
}

export const config = defineRouteConfig({
    label: "Assets",
    icon: SquareTwoStack
})

export const handle = {
    breadcrumb: () => "Assets",
}

export default AssetsPage