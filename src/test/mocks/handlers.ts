import { http, HttpResponse } from 'msw';

// Mock data
const mockBoards = [
  {
    name: 'Platform Launch',
    columns: [
      {
        name: 'Todo',
        tasks: [
          {
            title: 'Build UI for onboarding flow',
            description: '',
            status: 'Todo',
            subtasks: [
              { title: 'Sign up page', isCompleted: true },
              { title: 'Sign in page', isCompleted: false },
              { title: 'Welcome page', isCompleted: false },
            ],
          },
        ],
      },
      { name: 'Doing', tasks: [] },
      { name: 'Done', tasks: [] },
    ],
  },
];

export const handlers = [
  // Mock GET /api/boards.json
  http.get('/api/boards.json', () => {
    return HttpResponse.json(mockBoards);
  }),

  // Mock error scenario
  http.get('/api/boards-error.json', () => {
    return new HttpResponse(null, { status: 500 });
  }),
];
