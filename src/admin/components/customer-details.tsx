import { Container, Heading, Text } from "@medusajs/ui";
import { CustomerDTO } from "@medusajs/framework/types";
import { SectionRow } from "./section-row";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { FormDrawer } from "./form.drawer";
import { useParams } from "react-router-dom";
import { usePrompt } from "@medusajs/ui";

type EntityType = "asset" | "service-instance";

interface CustomerDetailsComponentProps {
    customer: CustomerDTO;
    entityType?: EntityType;
}

export const CustomerDetailsComponent = ({ customer, entityType = "asset" }: CustomerDetailsComponentProps) => {
    const params = useParams();
    const entityId = params.id || "";
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    
    return (
        <Container className="px-0 py-0 divide-y">
            <div className="flex items-center">
                <Heading level="h3" className="py-4 px-4">Customer details</Heading>
                {/* Currently disabled because it's not working */}
                {/* <ActionMenu groups={[{
                    actions: [
                    {
                        icon: <ArrowPath />,
                        label: "Transfer ownership",
                        onClick: () => setIsDrawerOpen(true)
                    },
                    ]
                }]} /> */}
            </div>
            {customer ? (
                <>
                    <SectionRow title="Name" value={`${customer.first_name} ${customer.last_name}`} />
                    <SectionRow title="Email" value={customer.email} />
                    <SectionRow title="Company name" value={customer.company_name} />
                    <SectionRow title="Phone" value={customer.phone} />
                </>
            ) : (
                <Text className="py-4 px-4">No customer data</Text>
            )}
            <TransferOwnershipDrawer 
                isOpen={isDrawerOpen} 
                onOpenChange={setIsDrawerOpen} 
                entityId={entityId}
                entityType={entityType}
                currentCustomer={customer}
            />
        </Container>
    )
}

type CustomerOption = {
    label: string;
    value: string;
}

const TransferOwnershipDrawer = ({ 
    isOpen, 
    onOpenChange, 
    entityId,
    entityType,
    currentCustomer
}: { 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void, 
    entityId: string,
    entityType: EntityType,
    currentCustomer: CustomerDTO
}) => {
    const dialog = usePrompt();
    const queryClient = useQueryClient();
    const form = useForm({
        defaultValues: { 
            new_owner_id: "",
        },
    });

    const { data: customers, isLoading } = useQuery({
        queryKey: ["customers"],
        queryFn: () => fetch("/admin/customers").then(res => res.json()),
        enabled: isOpen,
    });
    
    const customerOptions = customers?.customers
        ?.filter((customer: CustomerDTO) => customer.id !== currentCustomer?.id)
        ?.map((customer: CustomerDTO) => ({
            label: `${customer.first_name} ${customer.last_name} (${customer.email})`,
            value: customer.id,
        })) || [];

    const getEndpoint = () => {
        switch (entityType) {
            case "asset":
                return `/admin/assets/${entityId}/transfer-ownership`;
            case "service-instance":
                return `/admin/service-instances/${entityId}/transfer-ownership`;
            default:
                return `/admin/assets/${entityId}/transfer-ownership`;
        }
    };

    const handleSubmit = async (data: { new_owner_id: string }) => {
        try {
            const endpoint = getEndpoint();
            const result = await fetch(endpoint, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (!result.ok) {
                dialog({
                    title: "Error transferring ownership",
                    description: result.statusText,
                });
                throw new Error("Failed to transfer ownership");
            }
            
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({ queryKey: [entityType, entityId] });
            onOpenChange(false);
        } catch (error: any) {
            dialog({
                title: "Error transferring ownership",
                description: error.message || "An unknown error occurred",
            });
        }
    };

    return (
        <FormDrawer
            title="Transfer Ownership"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            form={form}
            onSubmit={handleSubmit}
        >
            {currentCustomer && (
                <div className="flex flex-col space-y-2 mb-4">
                    <label className="text-ui-fg-subtle text-xs font-medium">
                        Current Owner
                    </label>
                    <div className="bg-ui-bg-disabled border-ui-border-base rounded-md px-4 py-2 border text-ui-fg-disabled">
                        {`${currentCustomer.first_name} ${currentCustomer.last_name} (${currentCustomer.email})`}
                    </div>
                </div>
            )}
            <div className="flex flex-col space-y-2">
                <label htmlFor="new_owner_id" className="text-ui-fg-subtle text-xs font-medium">
                    New Owner
                </label>
                <select 
                    id="new_owner_id"
                    className="bg-ui-bg-field border-ui-border-base rounded-md px-4 py-2 border"
                    disabled={isLoading}
                    {...form.register("new_owner_id", { required: true })}
                >
                    <option value="" disabled>Select customer...</option>
                    {customerOptions.map((option: CustomerOption) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {isLoading && <Text className="text-ui-fg-subtle text-xs">Loading customers...</Text>}
                {!isLoading && customerOptions.length === 0 && (
                    <Text className="text-ui-fg-subtle text-xs">No other customers available</Text>
                )}
            </div>
        </FormDrawer>
    );
};
