import { useState, useEffect } from 'react';
import {
  Heading, Button, SimpleGrid, Spinner, Alert, AlertIcon,
  Text, VStack, useDisclosure, Center,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { projectApi } from '../api/project';
import { Project } from '../types';
import { ProjectCard } from '../components/project/ProjectCard';
import { CreateProjectModal } from '../components/project/CreateProjectModal';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data } = await projectApi.list();
      setProjects(data.data);
    } catch {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreated = () => {
    onClose();
    fetchProjects();
  };

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <>
      <VStack align="stretch" spacing={6}>
        <Heading size="lg" display="flex" justifyContent="space-between" alignItems="center">
          Projects
          <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={onOpen}>
            New Project
          </Button>
        </Heading>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {projects.length === 0 ? (
          <Center py={16}>
            <VStack spacing={3}>
              <Text fontSize="lg" color="gray.500">No projects yet</Text>
              <Button colorScheme="blue" onClick={onOpen}>Create your first project</Button>
            </VStack>
          </Center>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </SimpleGrid>
        )}
      </VStack>

      <CreateProjectModal isOpen={isOpen} onClose={onClose} onCreated={handleCreated} />
    </>
  );
}
