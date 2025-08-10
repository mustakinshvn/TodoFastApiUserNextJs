// Client-side API functions with authentication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  const baseHeaders = { "Content-Type": "application/json" };
  return token ? { ...baseHeaders, Authorization: `Bearer ${token}` } : baseHeaders;
}

// Todo API functions
export async function addTodo(content: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { status: "success", message: "Todo added successfully", data };
    } else {
      return { status: "error", message: data.detail || "Something went wrong" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

export async function getTodos() {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
}

export async function updateTodoStatus(id: number, content: string, isCompleted: boolean) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        content: content,
        isCompleted: !isCompleted,
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { status: "success", message: "Status changed successfully" };
    } else {
      return { status: "error", message: data.detail || "Something went wrong" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

export async function updateTodo(id: number, content: string, isCompleted: boolean) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ content, isCompleted }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { status: "success", message: "Todo updated successfully" };
    } else {
      return { status: "error", message: data.detail || "Something went wrong" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}

export async function deleteTodo(id: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { status: "success", message: data.message || "Todo deleted successfully" };
    } else {
      return { status: "error", message: data.detail || "Something went wrong" };
    }
  } catch (error) {
    return { status: "error", message: "Something went wrong" };
  }
}
