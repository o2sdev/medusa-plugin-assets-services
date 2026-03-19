import { useMutation, UseMutationResult, QueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

export type DeleteAssetParams = {
  queryClient: QueryClient
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useDeleteAssetMutation = ({
  queryClient,
  onSuccess,
  onError,
}: DeleteAssetParams): UseMutationResult<unknown, Error, string> => {
  return useMutation({
    mutationFn: async (assetId: string) => {
      return await sdk.client.fetch(`/admin/assets/${assetId}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assets"],
      })
      
      if (onSuccess) {
        onSuccess()
      }
    },
    onError: (error) => {
      if (onError) {
        onError(error)
      }
    },
  })
}