import { usePrompt } from "@medusajs/ui"
import { useForm } from "react-hook-form"
import { useQueryClient } from "@tanstack/react-query"
import { FormDrawer } from "../../../../components/form.drawer"
import { InputField, DateField } from "../../../../components/form-field"
import { AssetType } from "../../../../../modules/assets-services/types"

export const EditAssetDrawer = ({ isOpen, onOpenChange, asset }: { 
    isOpen: boolean, 
    onOpenChange: (open: boolean) => void, 
    asset: AssetType 
}) => {
    const dialog = usePrompt();
    const queryClient = useQueryClient()
    const form = useForm({
        defaultValues: { 
            name: asset.name,
            serial_number: asset.serial_number,
            end_of_warranty_date: asset.end_of_warranty_date,
            thumbnail: asset.thumbnail,
        },
    })

    const handleSubmit = async (data: any) => {
        const result = await fetch(`/admin/assets/${asset.id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        })

        if (!result.ok) {
            dialog({
                title: "Error updating asset",
                description: result.statusText,
            })
            throw new Error("Failed to update asset")
        }
        queryClient.invalidateQueries({ queryKey: ["asset", asset.id] })
        onOpenChange(false)
    }

    return (
        <FormDrawer
            title="Edit Item"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            form={form}
            onSubmit={handleSubmit}
        >
            <InputField name="name" label="Name" />
            <InputField name="serial_number" label="Serial number" />
            <DateField name="end_of_warranty_date" label="End of warranty date" />
            <InputField name="thumbnail" label="Thumbnail" />
        </FormDrawer>
    )
} 