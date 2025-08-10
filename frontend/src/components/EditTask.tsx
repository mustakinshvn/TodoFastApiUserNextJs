'use client'

import { updateTodo } from "@/lib/api";
import { ToDoItem } from "../../types";
import { useState } from "react";
import toast from "react-hot-toast";

export default function EditTask({task}:{task:ToDoItem}) {
  const [value, setValue] = useState(task.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!value || value.trim().length < 3) {
      toast.error("Task content must be at least 3 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const result = await updateTodo(task.id, value.trim(), task.isCompleted);
      
      if (result.status === "success") {
        toast.success(result.message);
        // Refresh the page to show the updated task
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col justify-between items-center gap-x-4 w-full">
      <input
        onChange={handleChange}
        type="text"
        minLength={3}
        maxLength={54}
        required
        name="edit_task"
        value={value}
        disabled={isLoading}
        className="w-full px-2 py-1 border border-gray-100 rounded-md"
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Updating..." : "Update Task"}
      </button>
    </form>
  );
}