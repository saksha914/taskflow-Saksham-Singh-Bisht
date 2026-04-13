import { Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Text } from '@chakra-ui/react';
import { Task, User } from '../../types';
import { PriorityBadge } from './PriorityBadge';

interface Props {
  tasks: Task[];
  users: User[];
  onEditTask: (task: Task) => void;
}

export function TaskListView({ tasks, users, onEditTask }: Props) {
  const getUserName = (id: string | null) => {
    if (!id) return 'Unassigned';
    const user = users.find(u => u.id === id);
    return user ? user.name : 'Unknown User';
  };

  return (
    <Box bg="white" _dark={{ bg: 'gray.700' }} borderRadius="md" overflowX="auto" shadow="sm">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Status</Th>
            <Th>Priority</Th>
            <Th>Assignee</Th>
            <Th>Due Date</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task) => (
            <Tr 
              key={task.id} 
              _hover={{ bg: 'gray.50', _dark: { bg: 'gray.600' }, cursor: 'pointer' }}
              onClick={() => onEditTask(task)}
            >
              <Td fontWeight="medium">{task.title}</Td>
              <Td>
                <Badge colorScheme={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'blue' : 'gray'}>
                  {task.status.replace('_', ' ')}
                </Badge>
              </Td>
              <Td><PriorityBadge priority={task.priority} /></Td>
              <Td>{getUserName(task.assignee_id)}</Td>
              <Td>
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
              </Td>
            </Tr>
          ))}
          {tasks.length === 0 && (
            <Tr>
              <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                <Text>No tasks found.</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
}
