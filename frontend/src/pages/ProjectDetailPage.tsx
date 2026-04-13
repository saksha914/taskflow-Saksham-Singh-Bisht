import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Heading, Text, Button, Spinner, Alert, AlertIcon, HStack, VStack,
  useDisclosure, useToast, Center, IconButton,
} from '@chakra-ui/react';
import { AddIcon, ArrowBackIcon, DeleteIcon } from '@chakra-ui/icons';
import { projectApi } from '../api/project';
import { taskApi } from '../api/task';
import { Project, Task, TaskStatus } from '../types';
import { KanbanBoard } from '../components/task/KanbanBoard';
import { TaskListView } from '../components/task/TaskListView';
import { TaskModal } from '../components/task/TaskModal';
import { TaskFilters } from '../components/task/TaskFilters';
import { useSSE } from '../hooks/useSSE';
import { userApi } from '../api/user';
import { User } from '../types';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchProject = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [{ data: projectData }, { data: usersData }] = await Promise.all([
        projectApi.getById(id),
        userApi.list()
      ]);
      setProject(projectData);
      setTasks(projectData.tasks || []);
      setUsers(usersData);
    } catch {
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  // SSE real-time updates
  useSSE(id!, useCallback((type: string, data: unknown) => {
    const task = data as Task;
    if (type === 'task:created') setTasks((prev) => prev.some(t => t.id === task.id) ? prev : [...prev, task]);
    if (type === 'task:updated') setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    if (type === 'task:deleted') setTasks((prev) => prev.filter((t) => t.id !== (task as any).id));
  }, []));

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const snapshot = [...tasks];
    setTasks((ts) => ts.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      await taskApi.update(taskId, { status: newStatus });
    } catch {
      setTasks(snapshot);
      toast({ title: 'Update failed', status: 'error', duration: 3000 });
    }
  };

  const handleCreateTask = async (data: Record<string, unknown>) => {
    if (!id) return;
    const { data: newTask } = await taskApi.create(id, data as any);
    setTasks((prev) => prev.some(t => t.id === newTask.id) ? prev : [...prev, newTask]);
  };

  const handleUpdateTask = async (data: Record<string, unknown>) => {
    if (!editingTask) return;
    const { data: updated } = await taskApi.update(editingTask.id, data as any);
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleDeleteProject = async () => {
    if (!id) return;
    try {
      await projectApi.remove(id);
      navigate('/projects');
      toast({ title: 'Project deleted', status: 'success', duration: 3000 });
    } catch {
      toast({ title: 'Delete failed', status: 'error', duration: 3000 });
    }
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    onOpen();
  };

  const openCreateModal = () => {
    setEditingTask(null);
    onOpen();
  };

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error || !project) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error || 'Project not found'}
      </Alert>
    );
  }

  const filteredTasks = statusFilter ? tasks.filter((t) => t.status === statusFilter) : tasks;

  return (
    <VStack align="stretch" spacing={6}>
      <HStack justify="space-between" wrap="wrap" gap={3}>
        <HStack>
          <IconButton
            aria-label="Back"
            icon={<ArrowBackIcon />}
            variant="ghost"
            onClick={() => navigate('/projects')}
          />
          <VStack align="start" spacing={0}>
            <Heading size="lg">{project.name}</Heading>
            {project.description && (
              <Text color="gray.500" fontSize="sm">{project.description}</Text>
            )}
          </VStack>
        </HStack>
        <HStack>
          <Button 
            size="sm" 
            variant={viewMode === 'kanban' ? 'solid' : 'outline'} 
            colorScheme="teal" 
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button 
            size="sm" 
            variant={viewMode === 'list' ? 'solid' : 'outline'} 
            colorScheme="teal" 
            onClick={() => setViewMode('list')}
          >
            List
          </Button>
          <Button leftIcon={<AddIcon />} colorScheme="blue" size="sm" onClick={openCreateModal} ml={2}>
            Add Task
          </Button>
          <IconButton
            aria-label="Delete project"
            icon={<DeleteIcon />}
            colorScheme="red"
            variant="outline"
            size="sm"
            onClick={handleDeleteProject}
          />
        </HStack>
      </HStack>

      <TaskFilters status={statusFilter} onStatusChange={setStatusFilter} />

      {viewMode === 'kanban' ? (
        <KanbanBoard
          key={`board-${statusFilter}`}
          tasks={filteredTasks}
          users={users}
          onStatusChange={handleStatusChange}
          onEditTask={openEditModal}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          users={users}
          onEditTask={openEditModal}
        />
      )}

      <TaskModal
        isOpen={isOpen}
        onClose={onClose}
        users={users}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
      />
    </VStack>
  );
}
