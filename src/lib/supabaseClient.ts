// Mock Supabase client for development
// This will be replaced with real Supabase when ready

interface MockSupabaseClient {
  auth: {
    getUser: () => Promise<{ data: { user: { id: string } | null } }>;
  };
  from: (table: string) => any;
  rpc: (fn: string, params: any) => any;
  storage: any;
  channel: (name: string) => any;
  removeChannel: (channel: any) => void;
}

// Mock current user for development
const mockUser = {
  id: "mock-staff-user",
  email: "staff@kinloop.com",
};

export const supabase: MockSupabaseClient = {
  auth: {
    getUser: async () => ({
      data: { user: mockUser },
    }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: () => ({
        order: () => ({ data: [], error: null }),
        data: [],
        error: null,
      }),
      gte: () => ({
        lt: () => ({
          order: () => ({ data: [], error: null }),
        }),
      }),
      data: [],
      error: null,
    }),
    insert: () => ({
      select: () => ({
        single: () => ({ data: null, error: null }),
      }),
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: () => ({ data: null, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: () => ({ error: null }),
    }),
  }),
  rpc: () => ({ data: [], error: null }),
  storage: {
    from: () => ({
      upload: () => ({ data: { path: "mock-path" }, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: "mock-url" } }),
    }),
  },
  channel: () => ({
    on: () => ({
      subscribe: () => "mock-subscription",
    }),
  }),
  removeChannel: () => {},
};
