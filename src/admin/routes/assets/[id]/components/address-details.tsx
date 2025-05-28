import { Container, Heading, Text } from "@medusajs/ui"
import { AddressDTO } from "@medusajs/framework/types"
import { SectionRow } from "../../../../components/section-row"
export const AddressDetails = ({ address }: { address: AddressDTO | undefined }) => (
    <Container className="px-0 py-0 divide-y">
        {address ? (
            <>
                <Heading level="h3" className="py-4 px-4">Address</Heading>
                <SectionRow title="City" value={address.city} />
                <SectionRow title="Province" value={address.province} />
                <SectionRow title="Country" value={address.country_code} />
                <SectionRow title="Postal code" value={address.postal_code} />
                <SectionRow title="Address row 1" value={address.address_1} />
                <SectionRow title="Address row 2" value={address.address_2} />
            </>
        ) : (
            <Text>No address data</Text>
        )}
    </Container>
) 