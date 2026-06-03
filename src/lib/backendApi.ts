/**
 * backendApi.ts - Helper functions for calling the Python backend
 * 
 * This file provides simple functions to call our backend API.
 * Instead of writing fetch() calls everywhere, we centralize them here.
 * 
 * HOW IT WORKS:
 * 1. Frontend calls signup() or login()
 * 2. These functions send HTTP requests to our Python backend
 * 3. Backend forwards the request to Supabase
 * 4. Response comes back through the same chain
 */

// Base URL for our Python backend
const API_BASE_URL = "http://localhost:8000";


// ===== TYPE DEFINITIONS =====
// These match what our backend returns

interface UserInfo {
  id: string;
  email: string;
  full_name?: string | null;
  created_at?: string | null;
}

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: UserInfo;
}

interface SignupData {
  email: string;
  password: string;
  full_name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface ApiError {
  detail: string;
}


// ===== SIGNUP FUNCTION =====
/**
 * Create a new user account
 * 
 * @param data - Object with email, password, and optional full_name
 * @returns User info from Supabase
 * @throws Error with message if signup fails
 * 
 * Example usage:
 *   const result = await signup({
 *     email: "student@example.com",
 *     password: "mypassword123",
 *     full_name: "Jane Smith"
 *   });
 */
export async function signup(data: SignupData): Promise<any> {
  // Make a POST request to our backend's signup endpoint
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // If the request failed, throw an error with the message from the backend
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Signup failed");
  }

  // Return the successful response
  return response.json();
}


// ===== LOGIN FUNCTION =====
/**
 * Log in with email and password
 * 
 * @param data - Object with email and password
 * @returns LoginResponse with tokens and user info
 * @throws Error with message if login fails
 * 
 * Example usage:
 *   const result = await login({
 *     email: "student@example.com",
 *     password: "mypassword123"
 *   });
 *   
 *   // Save the token for future requests
 *   localStorage.setItem("access_token", result.access_token);
 */
export async function login(data: LoginData): Promise<LoginResponse> {
  // Make a POST request to our backend's login endpoint
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  // If the request failed, throw an error with the message from the backend
  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new Error(error.detail || "Login failed");
  }

  // Return the successful response with tokens and user info
  return response.json();
}


// ===== HEALTH CHECK FUNCTION =====
/**
 * Check if the backend is running
 * 
 * @returns true if backend is healthy, false otherwise
 * 
 * Example usage:
 *   const isHealthy = await checkHealth();
 *   if (!isHealthy) {
 *     alert("Backend is not running!");
 *   }
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data.status === "ok";
  } catch {
    // If we can't reach the backend, it's not healthy
    return false;
  }
}


// ===== HELPER: Get stored token =====
/**
 * Get the stored access token from localStorage
 * 
 * @returns The access token string, or null if not logged in
 * 
 * Example usage:
 *   const token = getAccessToken();
 *   if (token) {
 *     // Make authenticated request
 *   }
 */
export function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}


// ===== HELPER: Store tokens after login =====
/**
 * Save login tokens to localStorage
 * 
 * @param response - The login response containing tokens
 * 
 * Example usage:
 *   const result = await login({ email, password });
 *   saveTokens(result);
 */
export function saveTokens(response: LoginResponse): void {
  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);
}


// ===== HELPER: Clear tokens (logout) =====
/**
 * Remove stored tokens from localStorage
 * 
 * Example usage:
 *   clearTokens();
 *   // User is now "logged out" on the frontend
 */
export function clearTokens(): void {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}


// ===== EXAMPLE: How to use in a React component =====
/*
import { login, signup, saveTokens } from "../lib/backendApi";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin() {
    try {
      setError("");
      const result = await login({ email, password });
      saveTokens(result);
      // Redirect to dashboard or home page
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div>
      <input value={email} onChange={(e) => setEmail(e.target.value)} />
      <input value={password} type="password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Log In</button>
      {error && <p style={{color: "red"}}>{error}</p>}
    </div>
  );
}
*/