import { Box, Container } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <Box minH="100vh">
      <Navbar />
      <Container maxW="1280px" py={6} px={4}>
        <Outlet />
      </Container>
    </Box>
  );
}
