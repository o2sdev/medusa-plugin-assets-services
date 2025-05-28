import { Badge, Text, clx, Drawer } from "@medusajs/ui"
import { useState } from "react"

export type SectionRowProps = {
  title: string
  value?: React.ReactNode | string | null
  actions?: React.ReactNode
  badge?: boolean
  isImage?: boolean
  imageAlt?: string
  onClick?: React.MouseEventHandler<HTMLDivElement>
}

export const SectionRow = ({ title, value, actions, badge, isImage, imageAlt = "Image", onClick }: SectionRowProps) => {
  const isValueString = typeof value === "string" || !value
  const [isZoomOpen, setIsZoomOpen] = useState(false)

  const handleImageClick = (e: React.MouseEvent) => {
    if (isImage) {
      e.stopPropagation()
      setIsZoomOpen(true)
    }
  }

  return (
    <div
      className={clx(
        `text-ui-fg-subtle grid w-full grid-cols-2 items-center gap-4 px-6 py-4`,
        {
          "grid-cols-[1fr_1fr_28px]": !!actions,
          "cursor-pointer transition-all hover:bg-ui-bg-base-hover": !!onClick,
        }
      )}
      onClick={onClick}
    >
      <Text size="small" weight="plus" leading="compact">
        {title}
      </Text>

      {badge ? (
        <Badge className="w-fit" color="grey">{value}</Badge>
      ) : isImage ? (
        <>
          <div 
            className="h-16 w-16 rounded overflow-hidden border border-ui-border-base cursor-pointer"
            onClick={handleImageClick}
          >
            <img 
              src={value as string}
              alt={imageAlt}
              className="w-full h-full object-cover"
            />
          </div>
          
          <Drawer open={isZoomOpen} onOpenChange={setIsZoomOpen}>
            <Drawer.Content>
              <Drawer.Header>
                <Drawer.Title>{imageAlt}</Drawer.Title>
              </Drawer.Header>
              <Drawer.Body>
                <div className="flex justify-center p-4">
                  <div className="max-h-[70vh] max-w-full overflow-hidden rounded-md">
                    <img 
                      src={value as string} 
                      alt={imageAlt} 
                      className="h-auto w-auto object-contain"
                    />
                  </div>
                </div>
              </Drawer.Body>
            </Drawer.Content>
          </Drawer>
        </>
      ) : isValueString ? (
        <Text
          size="small"
          leading="compact"
          className="whitespace-pre-line text-pretty"
        >
          {value ?? "-"}
        </Text>
      ) : (
        <div className="flex flex-wrap gap-1">{value}</div>
      )}

      {actions && <div>{actions}</div>}
    </div>
  )
}