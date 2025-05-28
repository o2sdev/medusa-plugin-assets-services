import { Container, Heading } from "@medusajs/ui"

export const MediaComponent = ({ url }: { url: string }) => {
    return (
        url ? (
            <Container>
                <Heading level="h1" className="pb-4">Media</Heading>
                <img
                    src={url}
                    alt="Media"
                    className="rounded w-48 h-48 object-cover"
                />
            </Container>
        ) : (
            <></>
        )
    );
}