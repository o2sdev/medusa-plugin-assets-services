import { Heading, Text, Container, IconButton, usePrompt } from "@medusajs/ui"
import { useNavigate, useParams } from "react-router-dom"
import { TwoColumnLayout } from "../../../layouts/two-column"
import { ArrowUturnLeft, Pencil, Trash } from "@medusajs/icons"
import { CustomerDetailsComponent } from "../../../components/customer-details"
import { PriceDetailsComponent } from "../../../components/price-details"
import { JsonViewSection } from "../../../components/json-view-section"
import { ActionMenu } from "../../../components/action-menu"
import { useState } from "react"

import { useServiceInstance } from "./hooks/use-service-instance"
import { ServiceInstanceDetails } from "./components/service-instance-details"
import { EditServiceInstanceDrawer } from "./components/edit-service-instance-drawer"
import { AssetsTableWidget } from "./components/assets-table-widget"

const ServiceItemDetailsPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { serviceInstance, isLoading, deleteServiceInstance } = useServiceInstance(id)
    const dialog = usePrompt()
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    if (isLoading) {
        return (
            <Container>
                <Heading level="h2">Service Instance Details</Heading>
                <Text>Loading service instance...</Text>
            </Container>
        )
    }

    if (!serviceInstance) {
        return (
            <Container>
                <Heading level="h2">Service Instance Details</Heading>
                <Text>Service instance not found</Text>
            </Container>
        )
    }

    const instance = serviceInstance
    return (
        <>
            <Container>
                <div className="flex items-center gap-4">
                    <IconButton onClick={() => navigate(-1)}>
                        <ArrowUturnLeft />
                    </IconButton>
                    <Heading level="h2">Service Instance Details</Heading>
                    <ActionMenu groups={[{
                        actions: [
                            {
                                icon: <Pencil />,
                                label: "Edit",
                                onClick: () => setIsDrawerOpen(true)
                            },
                            {
                                icon: <Trash />,
                                label: "Delete",
                                onClick: async () => {
                                    const userHasConfirmed = await dialog({
                                        title: "Are you sure you want to delete this service instance?",
                                        description: "This action cannot be undone.",
                                        confirmText: "Delete",
                                        cancelText: "Cancel",
                                    });
                                    if (userHasConfirmed) {
                                        deleteServiceInstance(instance.id)
                                        navigate(-1)
                                    }
                                }
                            }
                        ]
                    }]} />
                </div>
            </Container>
            <EditServiceInstanceDrawer isOpen={isDrawerOpen} onOpenChange={setIsDrawerOpen} instance={instance} />
            <TwoColumnLayout
                firstCol={<ServiceInstanceDetails instance={instance} />}
                secondCol={
                    <>
                        <CustomerDetailsComponent customer={instance.customer} entityType="service-instance" />
                        <PriceDetailsComponent totals={instance.totals} />
                    </>
                }
            />
            <AssetsTableWidget assets={instance.assets} isLoading={isLoading} />
            <JsonViewSection data={instance} />
        </>
    )
}

export const handle = {
    breadcrumb: () => "Service instance details",
}

export default ServiceItemDetailsPage