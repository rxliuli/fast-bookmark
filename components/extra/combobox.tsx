import { useMemo } from 'react'
import { CheckIcon, ChevronsUpDownIcon } from 'lucide-react'
import { useControllableState } from '@radix-ui/react-use-controllable-state'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export type ComboboxOption = {
  value: string
  label: string
}

export function Combobox(props: {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useControllableState({
    prop: props.open,
    defaultProp: false,
    onChange: props.onOpenChange,
  })

  const placeholder = useMemo(() => {
    return props.value
      ? props.options.find((option) => option.value === props.value)?.label
      : props.placeholder ?? 'Select option...'
  }, [props.value, props.options, props.placeholder])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {placeholder}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 bg-[#f9fafb] dark:bg-[#121827]">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>No match found.</CommandEmpty>
            <CommandGroup>
              {props.options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  content={option.label}
                  onSelect={(currentValue) => {
                    props.onValueChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <CheckIcon
                    className={cn(
                      'mr-2 h-4 w-4',
                      props.value === option.value
                        ? 'opacity-100'
                        : 'opacity-0',
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
