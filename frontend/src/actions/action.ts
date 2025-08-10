"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Authentication functions

export async function loginUser(email: string, password: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Set HTTP-only cookie for security
      const cookieStore = await cookies();
      cookieStore.set("token", data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
      return { status: "success", message: "Login successful" };
    } else {
      return { status: "error", message: data.detail || "Login failed" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

export async function signupUser(username: string, email: string, password: string) {
  try {
    const response = await fetch("http://localhost:8000/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      return { status: "success", message: "Account created successfully" };
    } else {
      return { status: "error", message: data.detail || "Signup failed" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  revalidatePath("/");
  return { status: "success", message: "Logged out successfully" };
}

// Get auth token for API requests
async function getAuthHeaders(): Promise<Record<string, string>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  console.log("Token from cookies:", token ? "Token exists" : "No token"); // Debug log
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Debug function to check authentication
export async function checkAuth() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    return { authenticated: !!token, hasToken: !!token };
  } catch (error) {
    return { authenticated: false, hasToken: false };
  }
}

// Get todos with authentication
export async function get_todos() {
  try {
    const authHeaders = await getAuthHeaders();
    console.log("Auth headers:", authHeaders); // Debug log
    
    const response = await fetch("http://localhost:8000/todos/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      cache: "no-store" as RequestCache,
    });

    console.log("Response status:", response.status); // Debug log

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log("Response not ok:", await response.text()); // Debug log
      return [];
    }
  } catch (error) {
    console.log("Error in get_todos:", error); // Debug log
    return [];
  }
}

// add_todo

export async function add_todo(
  state: { status: string; message: string },
  formData: FormData
) {
  const new_todo = formData.get("add_task") as string;

  //TODO add validation through Zod or Yup

  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch("http://localhost:8000/todos/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ content: new_todo }),
    });
    revalidatePath("/todos");
    const data = await response.json();
    if (data.content) {
      revalidatePath("/todos/");
      return { status: "success", message: "Todo added successfully" };
    } else {
      return { status: "error", message: "Something went wrong" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

// Edit todo

export async function edit_todo(
  state: { status: string; message: string },
  {
    id,
    content,
    isCompleted,
  }: { id: number; content: string; isCompleted: boolean }
) {
  // console.log({id,content,isCompleted})

  //TODO add validation through Zod or Yup

  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`http://localhost:8000/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ content, isCompleted }),
    });
    const res = await response.json();
    if (res.content) {
      revalidatePath("/todos/");
      return { status: "success", message: "Todo edited successfully" };
    } else {
      return { status: "error", message: "Not Found" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

// Status Change

export async function status_change(
  id: number,
  content: string,
  isCompleted: boolean
) {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`http://localhost:8000/todos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({
        content: content,
        isCompleted: !isCompleted,
      }),
    });
    const res = await response.json();
    if (res.content) {
      revalidatePath("/todos/");
      return { status: "success", message: "Status changed successfully" };
    } else {
      return { status: "error", message: "Not Found" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

// Delete todo

export async function delete_todo(id: number) {
  try {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`http://localhost:8000/todos/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
    });
    const res = await response.json();
    if(res.message){
        revalidatePath("/todos/");
        return { status: "success", message: res.message };
    } else {
        return { status: "error", message: "Something went wrong" };
    }
   
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

