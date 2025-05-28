import { useMutation, QueryClient, UseMutationResult } from "@tanstack/react-query"

export type ServiceInstanceUnlinkAssetParams = {
    queryClient: QueryClient
    onSuccess?: () => void
    onError?: (error: Error) => void
}

export const useServiceInstanceUnlinkAssetMutation = ({
    queryClient,
    onSuccess,
    onError,
  }: ServiceInstanceUnlinkAssetParams): UseMutationResult<unknown, Error, {serviceInstanceId: string, assetId: string}> => {
    return useMutation({
        mutationFn: async ({serviceInstanceId, assetId}: {serviceInstanceId: string, assetId: string}) => {
            const response = await fetch(`/admin/service-instances/${serviceInstanceId}/assets/${assetId}/link`, {
                method: "DELETE",
                credentials: "include",
            })

            if (!response.ok) {
                throw new Error("Failed to unlink asset")
            }

            return response.json()
        },
        onSuccess: () => {
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