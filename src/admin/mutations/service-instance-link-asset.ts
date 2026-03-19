import { useMutation, QueryClient, UseMutationResult } from "@tanstack/react-query"
import { sdk } from "../lib/sdk"

export type ServiceInstanceUnlinkAssetParams = {
    queryClient: QueryClient
    onSuccess?: () => void
    onError?: (error: Error) => void
}

export const useServiceInstanceLinkAssetMutation = ({
    queryClient,
    onSuccess,
    onError,
  }: ServiceInstanceUnlinkAssetParams): UseMutationResult<unknown, Error, {serviceInstanceId: string, assetId: string}> => {
    return useMutation({
        mutationFn: async ({serviceInstanceId, assetId}: {serviceInstanceId: string, assetId: string}) => {
            return await sdk.client.fetch(`/admin/service-instances/${serviceInstanceId}/assets/${assetId}/link`, {
                method: "POST",
            })
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