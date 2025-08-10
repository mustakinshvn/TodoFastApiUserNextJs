"use client"

import { useEffect, useState } from "react";
import { ToDoItem } from "../../types";
import Task from "./task";
import { getTodos } from "@/lib/api";

export default function TodoTable() {
    const [todoList, setTodoList] = useState<ToDoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const todos = await getTodos();
                setTodoList(todos);
            } catch (error) {
                console.error("Error fetching todos:", error);
                setTodoList([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTodos();
    }, []);

    const sortedTodos = todoList.sort((a: ToDoItem, b: ToDoItem) => a.id - b.id);

    if (isLoading) {
        return (
            <div className="w-full flex justify-center items-center py-8">
                <div className="text-gray-500">Loading todos...</div>
            </div>
        );
    }

    return (
        <table className="w-full">
            <thead className="w-full">
                <tr className="w-full flex justify-between items-center px-2 py-1 bg-gray-100 shadow-md">
                    <th>Task</th>
                    <th>Actions</th>
                </tr>
            </thead>

            <tbody>
                {sortedTodos.length === 0 ? (
                    <tr className="w-full flex justify-center items-center px-2 py-4">
                        <td className="text-gray-500">No todos found. Add some tasks!</td>
                    </tr>
                ) : (
                    sortedTodos.map((task: ToDoItem) => (
                        <Task key={task.id} todo={task} />
                    ))
                )}
            </tbody>
        </table>
    );
}