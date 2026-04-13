import { useState, useEffect } from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Button, FormControl, FormLabel, Input, Textarea,
  Select, Alert, AlertIcon, VStack, Box, Text, HStack, Badge
} from '@chakra-ui/react';
import { Task, User } from '../../types';
import { PriorityBadge } from './PriorityBadge';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  task?: Task | null;
  users: User[];
}

export function TaskModal({ isOpen, onClose, onSubmit, task, users }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setAssigneeId(task.assignee_id || '');
      setDueDate(task.due_date || '');
      setIsEditMode(false);
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssigneeId('');
      setDueDate('');
      setIsEditMode(true);
    }
  }, [task, isOpen]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onSubmit({
        title,
        description: description || undefined,
        status,
        priority,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
      });
      onClose();
    } catch {
      setError('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{!isEditMode && task ? task.title : (task ? 'Edit Task' : 'New Task')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!isEditMode && task ? (
            <VStack align="stretch" spacing={4}>
              <Box>
                <Text fontWeight="bold" color="gray.500" fontSize="sm">Description</Text>
                <Text mt={1} whiteSpace="pre-wrap">{task.description || 'No description provided.'}</Text>
              </Box>
              <HStack spacing={8}>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Status</Text>
                  <Badge mt={1} colorScheme={task.status === 'done' ? 'green' : task.status === 'in_progress' ? 'blue' : 'gray'}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Priority</Text>
                  <Box mt={1}><PriorityBadge priority={task.priority} /></Box>
                </Box>
              </HStack>
              <HStack spacing={8}>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Assignee</Text>
                  <Text mt={1}>{task.assignee_id ? users.find(u => u.id === task.assignee_id)?.name || 'Unknown' : 'Unassigned'}</Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" color="gray.500" fontSize="sm">Due Date</Text>
                  <Text mt={1}>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'None'}</Text>
                </Box>
              </HStack>
            </VStack>
          ) : (
            <>
              <FormControl isRequired mb={4}>
            <FormLabel>Title</FormLabel>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Status</FormLabel>
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Priority</FormLabel>
            <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Assignee</FormLabel>
            <Select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Due Date</FormLabel>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </FormControl>
          </>
          )}
        </ModalBody>
        <ModalFooter>
          {!isEditMode && task ? (
            <>
              <Button variant="ghost" mr={3} onClick={onClose}>Close</Button>
              <Button colorScheme="blue" onClick={() => setIsEditMode(true)}>Edit</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" mr={3} onClick={() => task ? setIsEditMode(false) : onClose()}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                {task ? 'Update' : 'Create'}
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
