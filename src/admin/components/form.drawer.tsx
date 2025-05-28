import { Button, Drawer, Heading } from "@medusajs/ui"
import { FormProvider, UseFormReturn } from "react-hook-form"
import { ReactNode } from "react"

type FormDrawerProps = {
  title: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<any>
  onSubmit: (data: any) => Promise<void> | void
  children: ReactNode
}

export const FormDrawer = ({
  title,
  isOpen,
  onOpenChange,
  form,
  onSubmit,
  children
}: FormDrawerProps) => {
  const handleSubmit = form.handleSubmit(onSubmit)

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild></Drawer.Trigger>
      <Drawer.Content>
        <FormProvider {...form}>
          <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
            <Drawer.Header>
              <Heading className="capitalize">{title}</Heading>
            </Drawer.Header>
            <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-4 overflow-y-auto">
              {children}
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">Cancel</Button>
                </Drawer.Close>
                <Button size="small" type="submit">Save</Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  )
}