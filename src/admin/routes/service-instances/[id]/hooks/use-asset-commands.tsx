import { createDataTableCommandHelper, DataTableRowSelectionState } from "@medusajs/ui"
import React from "react"

export const useAssetCommands = (
  serviceInstanceId: string | undefined,
  deleteMutation: any,
  unlinkMutation: any,
  selectionSetter: React.Dispatch<React.SetStateAction<DataTableRowSelectionState>>
) => {
  const commandHelper = createDataTableCommandHelper()
  
  return [
    commandHelper.command({
      label: "Unlink",
      shortcut: "U",
      action: async (selection) => {
        if (!serviceInstanceId) return
        
        const assetsToUnlinkIds = Object.keys(selection)
        for (const assetId of assetsToUnlinkIds) {
          await unlinkMutation.mutateAsync({ serviceInstanceId, assetId })
        }
        selectionSetter({})
      }
    }),
    commandHelper.command({
      label: "Delete",
      shortcut: "D",
      action: async (selection) => {
        const assetsToDeleteIds = Object.keys(selection)
        for (const assetId of assetsToDeleteIds) {
          await deleteMutation.mutateAsync(assetId)
        }
        selectionSetter({})
      }
    })
  ]
} 