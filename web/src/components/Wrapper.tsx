import { Box } from '@chakra-ui/react';
import React from 'react'

// Handles different screen sizes, with a default value set to "regular"
interface WrapperProps {
  variant?: 'small' | 'regular'
}

export const Wrapper: React.FC<WrapperProps> = ({
  children, 
  variant="regular"}) => {
    return (
      <Box 
        mt={10} 
        maxWidth={variant === 'regular' ? "800px" : "400px"}
        mx="auto"
        w="100%"
      >
        {children}
      </Box>
    );
}