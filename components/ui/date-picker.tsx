import * as React from "react"
import { cn } from "@/utils/utils"

interface DatePickerProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => (
    <input
      type="datetime-local"
      ref={ref}
      className={cn(
        "block w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
DatePicker.displayName = "DatePicker"

export { DatePicker } 