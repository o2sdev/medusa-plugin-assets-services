import { useQuery, useQueryClient } from "@tanstack/react-query"
import { usePrompt } from "@medusajs/ui"
import { ServiceInstanceResponseType } from "../../../../../modules/assets-services/types"
import { useDeleteServiceInstanceMutation } from "../../../../mutations/delete-service-instance"

export const useServiceInstance = (id: string | undefined) => {
  const queryClient = useQueryClient()
  const prompt = usePrompt()
  
  const { data, isLoading } = useQuery<ServiceInstanceResponseType>({
    queryKey: ["service-instance", id],
    queryFn: () => fetch(`/admin/service-instances/${id}`).then(res => res.json()),
    enabled: !!id
  })
  
  const deleteServiceInstanceMutation = useDeleteServiceInstanceMutation({
    queryClient,
    onError: (error) => {
      prompt({
        title: "Error deleting service instance",
        description: error.message,
      })
    }
  })
  
  return {
    serviceInstance: data?.serviceInstance,
    isLoading,
    deleteServiceInstance: deleteServiceInstanceMutation.mutate
  }
} 