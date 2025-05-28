
import { useMutation, UseMutationResult, QueryClient } from "@tanstack/react-query"

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
      const response = await fetch(`/admin/assets/${assetId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete asset")
      }

      return response.json()
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