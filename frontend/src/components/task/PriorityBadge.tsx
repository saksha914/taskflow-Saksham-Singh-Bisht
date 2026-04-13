import { Badge } from '@chakra-ui/react';
import { TaskPriority } from '../../types';

const COLOR_MAP: Record<TaskPriority, string> = {
  high: 'red',
  medium: 'yellow',
  low: 'green',
};

interface Props {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: Props) {
  return (
    <Badge colorScheme={COLOR_MAP[priority]} fontSize="xs">
      {priority}
    </Badge>
  );
}
