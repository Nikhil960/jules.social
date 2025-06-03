/**
 * Mock implementation of the fetch API for testing
 */

export const mockFetch = vi.fn();

// Reset the mock between tests
export const resetMockFetch = () => {
  mockFetch.mockReset();
};

// Helper to mock a successful response
export const mockSuccessResponse = (data: any) => {
  return {
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Map(),
  };
};

// Helper to mock an error response
export const mockErrorResponse = (status = 400, data: any = { error: 'Error' }) => {
  return {
    ok: false,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Map(),
  };
};

// Helper to mock a network error
export const mockNetworkError = () => {
  return mockFetch.mockRejectedValueOnce(new Error('Network error'));
};