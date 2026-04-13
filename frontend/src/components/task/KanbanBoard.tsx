import { Box, Heading, VStack, SimpleGrid, useColorModeValue, Text } from '@chakra-ui/react';
import { DndContext, DragEndEvent, DragOverEvent, closestCorners, DragOverlay, DragStartEvent, PointerSensor, KeyboardSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useState } from 'react';
import { Task, TaskStatus, User } from '../../types';
import { DraggableTaskCard } from './DraggableTaskCard';
import { useDroppable } from '@dnd-kit/core';

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done'];
const LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};
const COLUMN_COLORS: Record<TaskStatus, string> = {
  todo: 'blue',
  in_progress: 'orange',
  done: 'green',
};

interface Props {
  tasks: Task[];
  users: User[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onEditTask: (task: Task) => void;
}

function DroppableColumn({ id, label, tasks, users, onEditTask }: {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  users: User[];
  onEditTask: (task: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const bg = useColorModeValue('gray.50', 'gray.800');
  const headerColor = COLUMN_COLORS[id];

  return (
    <Box
      ref={setNodeRef}
      bg={isOver ? useColorModeValue('blue.50', 'gray.700') : bg}
      borderRadius="lg"
      p={4}
      minH="300px"
      transition="background 0.2s"
    >
      <Heading size="sm" mb={4} display="flex" alignItems="center" gap={2}>
        <Box w={3} h={3} borderRadius="full" bg={`${headerColor}.400`} />
        {label}
        <Text as="span" fontWeight="normal" fontSize="sm" color="gray.500">
          ({tasks.length})
        </Text>
      </Heading>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <VStack spacing={3} align="stretch">
          {tasks.length === 0 ? (
            <Text fontSize="sm" color="gray.400" textAlign="center" py={8}>
              No tasks
            </Text>
          ) : (
            tasks.map((task) => (
              <DraggableTaskCard key={task.id} task={task} users={users} onEdit={() => onEditTask(task)} />
            ))
          )}
        </VStack>
      </SortableContext>
    </Box>
  );
}

export function KanbanBoard({ tasks, users, onStatusChange, onEditTask }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeTask = tasks.find((t) => t.id === activeId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = String(active.id);
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Check if dropped over a column
    const overId = String(over.id);
    let newStatus: TaskStatus | null = null;

    if (COLUMNS.includes(overId as TaskStatus)) {
      newStatus = overId as TaskStatus;
    } else {
      // Dropped over another task — find that task's column
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) newStatus = overTask.status;
    }

    if (newStatus && newStatus !== task.status) {
      onStatusChange(taskId, newStatus);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // handled in dragEnd
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        {COLUMNS.map((col) => (
          <DroppableColumn
            key={col}
            id={col}
            label={LABELS[col]}
            tasks={tasks.filter((t) => t.status === col)}
            users={users}
            onEditTask={onEditTask}
          />
        ))}
      </SimpleGrid>
      <DragOverlay>
        {activeTask ? (
          <DraggableTaskCard task={activeTask} users={users} onEdit={() => {}} isDragOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
