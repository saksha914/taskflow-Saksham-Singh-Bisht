-- Seed data: test user, project, and tasks
-- Password: password123 (bcrypt hash at cost 12)
INSERT INTO users (id, name, email, password) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Test User',
  'test@example.com',
  '$2a$12$AhVg8/XPkDVT4EUhtjxn3O9wdaVNKL2SKQMVlCwvu6C/eXpYY0Dju'
) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO users (id, name, email, password) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Other User',
  'other@example.com',
  '$2a$12$AhVg8/XPkDVT4EUhtjxn3O9wdaVNKL2SKQMVlCwvu6C/eXpYY0Dju'
) ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO projects (id, name, description, owner_id) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'Website Redesign',
  'Q2 project',
  'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO tasks (id, title, description, due_date, status, priority, project_id, assignee_id) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Design homepage', 'Create new mockups for the landing page with dark mode support.', '2026-05-01', 'todo', 'high', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001'),
  ('c0000000-0000-0000-0000-000000000002', 'Set up CI pipeline', 'Configure automated tests and Docker builds on pull requests.', '2026-05-15', 'in_progress', 'medium', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'),
  ('c0000000-0000-0000-0000-000000000003', 'Write unit tests', 'Achieve 80% combined testing coverage for auth and project endpoints.', '2026-04-30', 'done', 'low', 'b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  due_date = EXCLUDED.due_date,
  status = EXCLUDED.status,
  priority = EXCLUDED.priority;
