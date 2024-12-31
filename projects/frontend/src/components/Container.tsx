import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const containerVariants = cva('mx-auto px-4 sm:px-6 lg:px-8', {
  variants: {
    variant: {
      breakpointPadded: 'container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    },
  }
})

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof containerVariants> {
  asChild?: boolean
}

const Container: React.FC<ContainerProps> = ({
  children,
}) => {

  return (
    <div className="container max-w-7xl w-full h-full mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  )
}

export { Container, containerVariants }
