import { Box, Heading, Text, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';

interface Props {
  project: Project;
}

export function ProjectCard({ project }: Props) {
  const navigate = useNavigate();
  const bg = useColorModeValue('white', 'gray.700');

  return (
    <Box
      bg={bg}
      p={5}
      borderRadius="lg"
      shadow="sm"
      cursor="pointer"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <Heading size="sm" mb={2}>{project.name}</Heading>
      <Text fontSize="sm" color="gray.500" noOfLines={2}>
        {project.description || 'No description'}
      </Text>
      <Text fontSize="xs" color="gray.400" mt={3}>
        {new Date(project.created_at).toLocaleDateString()}
      </Text>
    </Box>
  );
}
