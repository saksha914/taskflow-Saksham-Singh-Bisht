import { Box, Text, HStack, useColorModeValue } from '@chakra-ui/react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, User } from '../../types';
import { PriorityBadge } from './PriorityBadge';
import { Avatar, Tooltip } from '@chakra-ui/react';

interface Props {
  task: Task;
  users: User[];
  onEdit: () => void;
  isDragOverlay?: boolean;
}

export function DraggableTaskCard({ task, users, onEdit, isDragOverlay }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  const bg = useColorModeValue('white', 'gray.700');
  const assignee = task.assignee_id ? users.find(u => u.id === task.assignee_id) : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Box
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      {...(!isDragOverlay ? attributes : {})}
      {...(!isDragOverlay ? listeners : {})}
      p={3}
      borderRadius="md"
      bg={bg}
      shadow={isDragOverlay ? 'lg' : 'sm'}
      cursor="grab"
      _active={{ cursor: 'grabbing', shadow: 'lg' }}
      onClick={(e) => {
        e.stopPropagation();
        onEdit();
      }}
    >
      <Text fontWeight="semibold" fontSize="sm" mb={2}>{task.title}</Text>
      <HStack justify="space-between">
        <HStack spacing={2}>
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <Text fontSize="xs" color="gray.500">
              {new Date(task.due_date).toLocaleDateString()}
            </Text>
          )}
        </HStack>
        {assignee && (
           <Tooltip label={assignee.name}>
             <Avatar size="2xs" name={assignee.name} />
           </Tooltip>
        )}
      </HStack>
    </Box>
  );
}
