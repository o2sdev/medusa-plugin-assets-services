import { Button, Container, Heading } from "@medusajs/ui"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ToolsSolid } from "@medusajs/icons"
import { useState } from "react"
import { CreateServiceInstanceModal } from "./components/create-service-instance-modal"
import { ServiceInstancesTable } from "./components/service-instances-table"

const ServiceInstancesPage = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    return (
        <>
            <Container className="flex items-center justify-between mb-2">
                <Heading level="h2">Service instances</Heading>
                <Button onClick={() => setIsCreateModalOpen(true)}>Create</Button>
            </Container>
            <ServiceInstancesTable />
            <CreateServiceInstanceModal open={isCreateModalOpen} setOpen={setIsCreateModalOpen} />
        </>
    )
}

export const config = defineRouteConfig({
    label: "Service instances",
    icon: ToolsSolid
})

export const handle = {
    breadcrumb: () => "Service instances",
}

export default ServiceInstancesPage