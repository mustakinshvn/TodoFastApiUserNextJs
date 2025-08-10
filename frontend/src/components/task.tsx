"use client"

import { ToDoItem } from "../../types"
import { FiTrash2, FiEdit   } from "react-icons/fi";
import { CiSquareCheck } from "react-icons/ci";
import ToolTip from "./ToolTip"
import { updateTodoStatus, deleteTodo } from "@/lib/api";
import { Modal } from "./ui/Modal";
import toast from "react-hot-toast";

export default function Task({ todo }: { todo: ToDoItem }) {

  const handleStatusChange = async () => {
    try {
      const result = await updateTodoStatus(todo.id, todo.content, todo.isCompleted);
      if (result.status === "success") {
        toast.success(result.message);
        // Refresh the page to show the updated status
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteTodo(todo.id);
      if (result.status === "success") {
        toast.success(result.message);
        // Refresh the page to show the updated list
        window.location.reload();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <tr className=" hover:bg-gray-100 flex  justify-between w-full">
     
     {/* <td>{todo.id}</td> */}
     <td>{todo.content}</td>
      {/* <td>{todo.isCompleted ? "Completed" : "Pending"}</td> */}

     <td className="flex gap-x-2 items-center justify-center sticky right-0 bg-white">
      
      <ToolTip tool_tip_content="Mark as Completed">
        <CiSquareCheck 
          size={30} 
          className={`${todo.isCompleted? " text-green-500 cursor-pointer " : "text-gray-300 cursor-pointer"} `}
          onClick={handleStatusChange}
        />
      </ToolTip>

      <ToolTip tool_tip_content="Edit Task">
        <Modal
          title="Edit Task"
          Editing={true}
          task={todo}
        >
          <FiEdit 
            size={24} 
            className="text-blue-300 hover:text-blue-500 cursor-pointer"
          />
        </Modal>
      </ToolTip>

      <ToolTip tool_tip_content="Delete Task">
        <FiTrash2 
          size={24} 
          className="text-red-300 hover:text-red-500 cursor-pointer"
          onClick={handleDelete}
        />
      </ToolTip>

     </td>

    </tr>
  )
}
