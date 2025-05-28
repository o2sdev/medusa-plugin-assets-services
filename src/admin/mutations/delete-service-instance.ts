import { useMutation, UseMutationResult, QueryClient } from "@tanstack/react-query"

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
      const response = await fetch(`/admin/service-instances/${serviceInstanceId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Failed to delete service instance")
      }

      return response.json()
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