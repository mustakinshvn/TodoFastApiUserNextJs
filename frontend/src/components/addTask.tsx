"use client"

import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { addTodo } from "@/lib/api";

export default function AddTask() {
  const ref = useRef<HTMLFormElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const content = formData.get("add_task") as string;

    if (!content || content.trim().length < 3) {
      toast.error("Task content must be at least 3 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const result = await addTodo(content.trim());
      
      if (result.status === "success") {
        ref.current?.reset();
        toast.success(result.message);
        // Refresh the page to show the new todo
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form 
      ref={ref} 
      onSubmit={handleSubmit}  
      className="flex flex-col justify-between items-center gap-x-4 w-full"
    >
      <input
        type="text"
        placeholder="Add Task here"
        minLength={3}
        maxLength={54}
        required
        name="add_task"
        className="w-full px-2 py-1 border border-gray-100 rounded-md"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
}