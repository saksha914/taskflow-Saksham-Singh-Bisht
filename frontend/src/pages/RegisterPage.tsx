import { useState } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Heading, VStack,
  Alert, AlertIcon, Text, Link as ChakraLink, useColorModeValue,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.700');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await authApi.register(name, email, password);
      login(data.token, data.user);
      navigate('/projects');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" alignItems="center" justifyContent="center" minH="100vh" px={4}>
      <Box bg={bg} p={8} borderRadius="lg" shadow="md" w="full" maxW="400px">
        <form onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <Heading size="lg">Create Account</Heading>
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            <FormControl isRequired>
              <FormLabel>Name</FormLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Button type="submit" colorScheme="blue" w="full" isLoading={loading}>
              Register
            </Button>
            <Text fontSize="sm">
              Already have an account?{' '}
              <ChakraLink as={Link} to="/login" color="blue.500">
                Sign in
              </ChakraLink>
            </Text>
          </VStack>
        </form>
      </Box>
    </Box>
  );
}
