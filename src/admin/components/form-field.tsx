import { Controller, useFormContext } from "react-hook-form"
import { Input, Label, DatePicker, Select } from "@medusajs/ui"
import { ReactNode } from "react"

type FormFieldProps = {
  name: string
  label: string
  children: ReactNode
}

export const FormField = ({ name, label, children }: FormFieldProps) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-x-1">
            <Label size="small" weight="plus">{label}</Label>
          </div>
          {children(field)}
        </div>
      )}
    />
  )
}

export const InputField = ({ name, label }: { name: string, label: string }) => {
  return (
    <FormField name={name} label={label}>
      {(field) => <Input {...field} />}
    </FormField>
  )
}

export const DateField = ({ name, label }: { name: string, label: string }) => {
  return (
    <FormField name={name} label={label}>
      {(field) => <DatePicker value={new Date(field.value)} onChange={field.onChange} />}
    </FormField>
  )
}

export const SelectField = ({ 
  name, 
  label, 
  options 
}: { 
  name: string, 
  label: string,
  options: string[] 
}) => {
  return (
    <FormField name={name} label={label}>
      {(field) => (
        <Select value={field.value} onValueChange={field.onChange}>
          <Select.Trigger>
            <Select.Value placeholder={`Select a ${label.toLowerCase()}`} />
          </Select.Trigger>
          <Select.Content>
            {options.map((item) => (
              <Select.Item key={item} value={item}>
                {item}
              </Select.Item>
            ))}
          </Select.Content>
        </Select>
      )}
    </FormField>
  )
}