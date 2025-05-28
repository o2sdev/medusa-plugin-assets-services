import { Badge, Text } from "@medusajs/ui"

type BadgeColor = "grey" | "green" | "red" | "blue" | "orange" | "purple" | undefined
type DetailItemProps = {
    label: string
    value?: string | null
    badge?: boolean
    color?: BadgeColor
}

export const DetailItem = ({ label, value, badge = false, color }: DetailItemProps) => {
    if (!value && !badge) return null
    
    return (
        <div className="grid w-full grid-cols-2 items-center gap-4">
            <Text weight="plus" className="text-ui-fg-subtle">{label}</Text>
            {badge ? (
                <Badge className="w-fit" color={color}>{value}</Badge>
            ) : (
                <Text as="span" className="text-ui-fg-subtle">{value}</Text>
            )}
        </div>
    )
}
