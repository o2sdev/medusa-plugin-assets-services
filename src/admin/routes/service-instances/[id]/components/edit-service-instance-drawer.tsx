import { usePrompt } from "@medusajs/ui"
import { useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { PaymentTypeEnum, ServiceInstanceStatusEnum, ServiceInstanceType } from "../../../../../modules/assets-services/types"
import { FormDrawer } from "../../../../components/form.drawer"
import { InputField, SelectField, DateField } from "../../../../components/form-field"

export const EditServiceInstanceDrawer = ({ 
    isOpen, 
    onOpenChange, 
    instance 
}: { 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void, 
    instance: ServiceInstanceType 
}) => {
    const dialog = usePrompt();
    const queryClient = useQueryClient()
    const form = useForm({
        defaultValues: {
            name: instance.name,
            status: instance.status,
            payment_type: instance.payment_type,
            start_date: instance.start_date,
            end_date: instance.end_date,
            purchase_date: instance.purchase_date,
        },
    })

    const handleSubmit = form.handleSubmit(async ({ name, status, payment_type, start_date, end_date, purchase_date }) => {
        const result = await fetch(`/admin/service-instances/${instance.id}`, {
            method: "PATCH",
            body: JSON.stringify({ name, status, payment_type, start_date, end_date, purchase_date }),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!result.ok) {
            dialog({
                title: "Error updating service instance",
                description: result.statusText,
            })
            throw new Error("Failed to update service instance")
        }
        queryClient.invalidateQueries({ queryKey: ["service-instance", instance.id] })
        onOpenChange(false)
    })

    return (
        <FormDrawer
            title="Edit Service Instance"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            form={form}
            onSubmit={handleSubmit}
        >
            <InputField name="name" label="Name" />
            <SelectField
                name="status"
                label="Status"
                options={Object.keys(ServiceInstanceStatusEnum)}
            />
            <SelectField
                name="payment_type"
                label="Payment type"
                options={Object.keys(PaymentTypeEnum)}
            />
            <DateField name="start_date" label="Start date" />
            <DateField name="end_date" label="End date" />
            <DateField name="purchase_date" label="Purchase date" />
        </FormDrawer>
    )
} 