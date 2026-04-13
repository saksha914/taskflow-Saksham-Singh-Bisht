import {
  Box, Flex, Heading, Spacer, Button, IconButton,
  useColorMode, useColorModeValue, HStack, Text, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.800');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box bg={bg} px={4} py={3} shadow="sm" position="sticky" top={0} zIndex={10}>
      <Flex align="center" maxW="1280px" mx="auto">
        <Heading size="md" cursor="pointer" onClick={() => navigate('/projects')}>
          TaskFlow
        </Heading>
        <Spacer />
        <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
          <Text fontSize="sm">{user?.name}</Text>
          <IconButton
            aria-label="Toggle dark mode"
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            onClick={toggleColorMode}
            variant="ghost"
            size="sm"
          />
          <Button size="sm" variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </HStack>
        {/* Mobile menu */}
        <Box display={{ base: 'block', md: 'none' }}>
          <Menu>
            <MenuButton as={IconButton} icon={<HamburgerIcon />} variant="ghost" size="sm" aria-label="Menu" />
            <MenuList>
              <MenuItem isDisabled>{user?.name}</MenuItem>
              <MenuItem onClick={toggleColorMode}>
                {colorMode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
}
