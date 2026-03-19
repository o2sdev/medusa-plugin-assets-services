import { useMutation, UseMutationResult, QueryClient } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

export type DeleteServiceInstanceParams = {
  queryClient: QueryClient
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export const useDeleteServiceInstanceMutation = ({
  queryClient,
  onSuccess,
  onError,
}: DeleteServiceInstanceParams): UseMutationResult<unknown, Error, string> => {
  return useMutation({
    mutationFn: async (serviceInstanceId: string) => {
      return await sdk.client.fetch(`/admin/service-instances/${serviceInstanceId}`, {
        method: "DELETE",
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-instances"],
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