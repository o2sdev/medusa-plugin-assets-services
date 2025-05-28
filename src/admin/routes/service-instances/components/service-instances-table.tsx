import { Container, createDataTableColumnHelper, DataTable, useDataTable, DataTablePaginationState, createDataTableCommandHelper, DataTableRowSelectionState, usePrompt, Button, Input, DataTableFilteringState, createDataTableFilterHelper } from "@medusajs/ui"
import { SingleColumnLayout } from "../../../layouts/single-column"
import { useNavigate } from "react-router-dom"
import { useMemo, useState } from "react"
import { PaymentTypeEnum, ServiceInstanceType, ServiceInstanceStatusEnum } from "../../../../modules/assets-services/types"
import { formatDate } from "../../../utils/format-date"
import { useDeleteServiceInstanceMutation } from "../../../mutations/delete-service-instance"
import { useQuery, useQueryClient } from "@tanstack/react-query"

export const ServiceInstancesTable = () => {
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

    const { data: response, isLoading } = useQuery({
        queryKey: ["service-instances", pagination.pageSize, offset, search, filtering],
        queryFn: () =>
            fetch(`/admin/service-instances?limit=${pagination.pageSize}&offset=${offset}${search ? `&q=${encodeURIComponent(search)}` : ""}${filtering.payment_type ? `&payment_type=${filtering.payment_type}` : ""}${filtering.status ? `&status=${filtering.status}` : ""}`)
                .then(res => res.json()),
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

    const columnHelper = createDataTableColumnHelper<ServiceInstanceType>()
    const commandHelper = createDataTableCommandHelper()

    const columns = [
        columnHelper.accessor("name", {
            header: "Name",
        }),
        columnHelper.accessor("customer.email", {
            header: "Customer",
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

    const filterHelper = createDataTableFilterHelper<ServiceInstanceType>()
    const filters = [
        filterHelper.accessor("payment_type", {
            type: "select",
            label: "Payment type",
            options: Object.entries(PaymentTypeEnum).map(([key, value]) => ({
                label: value,
                value: key,
            })),
        }),
        filterHelper.accessor("status", {
            type: "select",
            label: "Status",
            options: Object.entries(ServiceInstanceStatusEnum).map(([key, value]) => ({
                label: value,
                value: key,
            })),
        }),
    ]


    const deleteServiceInstanceMutation = useDeleteServiceInstanceMutation({
        queryClient,
        onSuccess: () => {
            setRowSelection({})
        },
        onError: (error) => {
            prompt({
                title: "Error deleting service instance",
                description: error.message,
            })
        }
    })

    const useCommands = (
        deleteMutation: typeof deleteServiceInstanceMutation,
        selectionSetter: React.Dispatch<React.SetStateAction<DataTableRowSelectionState>>
    ) => {
        return [
            commandHelper.command({
                label: "Delete",
                shortcut: "D",
                action: async (selection) => {
                    const serviceInstancesToDeleteIds = Object.keys(selection)
                    for (const serviceInstanceId of serviceInstancesToDeleteIds) {
                        await deleteMutation.mutate(serviceInstanceId)
                    }
                    selectionSetter({})
                }
            })
        ]
    }

    const commands = useCommands(deleteServiceInstanceMutation, setRowSelection)

    const table = useDataTable({
        columns: [
            columnHelper.select(),
            ...columns,
        ],
        data: response?.serviceInstances || [],
        getRowId: (row) => row.id,
        rowCount: response?.count || 0,
        isLoading,
        pagination: {
            state: pagination,
            onPaginationChange: setPagination,
        },
        onRowClick: (event, row) => {
            navigate(`/service-instances/${row.id}`)
        },
        commands,
        rowSelection: {
            state: rowSelection,
            onRowSelectionChange: setRowSelection,
        },
        filtering: {
            state: filtering,
            onFilteringChange: setFiltering,
        },
        filters,
    })

    return (
        <Container>
            <SingleColumnLayout>
                <div className="mb-4">
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
                            <DataTable.FilterMenu />
                        </DataTable.Toolbar>
                        <DataTable.Table />
                        <DataTable.Pagination />
                        <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
                    </DataTable>
                </div>
            </SingleColumnLayout>
        </Container>
    )
} 