import React from "react"
import { Toaster } from "sonner"

// simple wrapper — removed next-themes dependency
export function AppToaster(props: React.ComponentProps<typeof Toaster>) {
  return <Toaster {...props} />
}

export default AppToaster