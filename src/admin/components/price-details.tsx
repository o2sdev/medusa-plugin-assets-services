import { Container, Heading, Text } from "@medusajs/ui"
import { SectionRow } from "./section-row"


export const PriceDetailsComponent = ({ totals }: { totals: Record<string, unknown> }) => (
    <Container>
        <Heading level="h3">Price</Heading>
        <SectionRow title="Total Price" value={`${totals?.total_price?.value} ${totals?.currency}`} />
    </Container>
)