import { HStack, Select } from '@chakra-ui/react';

interface Props {
  status: string;
  onStatusChange: (val: string) => void;
}

export function TaskFilters({ status, onStatusChange }: Props) {
  return (
    <HStack spacing={4} mb={4}>
      <Select
        placeholder="All statuses"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        size="sm"
        w="200px"
      >
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </Select>
    </HStack>
  );
}
