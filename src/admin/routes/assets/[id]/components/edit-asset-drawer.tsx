import { usePrompt } from "@medusajs/ui"
import { sdk } from "../../../../lib/sdk"
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
        try {
            await sdk.client.fetch(`/admin/assets/${asset.id}`, {
                method: "PATCH",
                body: data,
            })
            queryClient.invalidateQueries({ queryKey: ["asset", asset.id] })
            onOpenChange(false)
        } catch (error: any) {
            dialog({
                title: "Error updating asset",
                description: error?.message || "Failed to update asset",
            })
            throw error
        }
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