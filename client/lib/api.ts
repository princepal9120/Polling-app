const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type User = {
  id: string;
  username: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
} & T;

export async function loginUser(username: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data: ApiResponse<{ user: User }> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logoutUser(userId: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    const data: ApiResponse<{}> = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Logout failed");
    }
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function checkUsernameAvailable(
  username: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_URL}/auth/check-username?username=${encodeURIComponent(username)}`
    );

    if (!response.ok) {
      throw new Error("Failed to check username");
    }

    const data: ApiResponse<{ isAvailable: boolean }> = await response.json();
    return data.isAvailable;
  } catch (error) {
    console.error("Check username error:", error);
    throw error;
  }
}

export async function fetchPoll(roomId: string) {
  try {
    const response = await fetch(`${API_URL}/polls/${roomId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch poll");
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch poll error:", error);
    throw error;
  }
}
