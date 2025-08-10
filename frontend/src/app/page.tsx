import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import TodoTable from "../components/todoTable";
import ProtectedRoute from "@/components/ProtectedRoute";



export default function Home() {
  return (
    <ProtectedRoute>
      <main className="max-w-5xl mx-auto mt-8">
        {/* Add Task Section */}
        <section>
          <Modal
            title="Add New Task"
            Adding={true}
            task={{ id: 0, content: "", isCompleted: false }} // Provide a default/empty ToDoItem object
          >
            <Button variant="default" className="w-full bg-teal-600 px-2 py-1 text-white uppercase text-lg">
              Add Task
            </Button>
          </Modal>
        </section>

        {/* Todo Table */}
        <section className="mt-4">
          <TodoTable />
        </section>

      </main>
    </ProtectedRoute>
  );
}