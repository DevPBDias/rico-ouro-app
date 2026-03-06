import { http, HttpResponse } from "msw";

export const handlers = [
  // Mock Supabase Auth
  http.post("*/auth/v1/token", () => {
    return HttpResponse.json({
      access_token: "mock-access-token",
      token_type: "bearer",
      expires_in: 3600,
      refresh_token: "mock-refresh-token",
      user: {
        id: "mock-user-id",
        aud: "authenticated",
        role: "authenticated",
        email: "test@example.com",
      },
    });
  }),

  // Mock Supabase Animals Table GET
  http.get("*/rest/v1/animals", () => {
    return HttpResponse.json([
      {
        id: "animal-1",
        rgn: "1234",
        name: "Boi Teste",
        updated_at: new Date().toISOString(),
      },
      {
        id: "animal-2",
        rgn: "5678",
        name: "Vaca Teste",
        updated_at: new Date().toISOString(),
      },
    ]);
  }),

  // Mock Supabase Animals Table POST/PATCH
  http.post("*/rest/v1/animals", async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json(data, { status: 201 });
  }),
  
  http.patch("*/rest/v1/animals", async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json(data, { status: 200 });
  }),

  // Add more handlers as needed for other tables (farms, etc)
];
