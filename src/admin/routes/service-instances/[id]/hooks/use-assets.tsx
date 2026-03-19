import { useState } from "react"
import { sdk } from "../../../../lib/sdk"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { usePrompt } from "@medusajs/ui"
import { useDeleteAssetMutation } from "../../../../mutations/delete-asset"
import { useServiceInstanceUnlinkAssetMutation } from "../../../../mutations/service-instance-unlink-asset"

export const useAssets = (serviceInstanceId: string | undefined) => {
  const [assetSearchQuery, setAssetSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  
  const { data: searchResults, refetch: searchAssets } = useQuery({
    queryKey: ["asset-search", assetSearchQuery],
    queryFn: async () => {
      if (!assetSearchQuery.trim()) {
        return { assets: [] }
      }
      setIsSearching(true)
      try {
        return await sdk.client.fetch(`/admin/assets?name=${encodeURIComponent(assetSearchQuery)}`)
      } finally {
        setIsSearching(false)
      }
    },
    enabled: false
  })
  
  const handleAssetLinkage = async (assetId: string) => {
    if (!serviceInstanceId) return
    
    try {
      await sdk.client.fetch(`/admin/service-instances/${serviceInstanceId}/assets/${assetId}/link`, {
        method: "POST",
      })
      
      queryClient.invalidateQueries({ queryKey: ["service-instance", serviceInstanceId] })
    } catch (error: any) {
      if (error?.status === 304) {
        prompt({
          title: "Error linking asset",
          description: "Asset already linked",
        })
        return
      }
      prompt({
        title: "Error linking asset",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    }
  }
  
  const deleteAssetMutation = useDeleteAssetMutation({
    queryClient,
    onSuccess: () => {
      if (serviceInstanceId) {
        queryClient.invalidateQueries({ queryKey: ["service-instance", serviceInstanceId] })
      }
    },
    onError: (error) => {
      prompt({
        title: "Error deleting asset",
        description: error.message,
      })
    }
  })

  const unlinkAssetMutation = useServiceInstanceUnlinkAssetMutation({
    queryClient,
    onSuccess: () => {
      if (serviceInstanceId) {
        queryClient.invalidateQueries({ queryKey: ["service-instance", serviceInstanceId] })
      }
    },
    onError: (error) => {
      prompt({
        title: "Error unlinking asset",
        description: error.message,
      })
    }
  })
  
  return {
    searchResults,
    searchAssets,
    assetSearchQuery,
    setAssetSearchQuery,
    isSearching,
    handleAssetLinkage,
    deleteAssetMutation,
    unlinkAssetMutation
  }
} 