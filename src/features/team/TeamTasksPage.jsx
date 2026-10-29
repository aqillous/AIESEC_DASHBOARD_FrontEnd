import { useState } from 'react';
import RecordForm from '../../components/forms/RecordForm.jsx';
import { Badge, Button, Card, EmptyState, Field, Input, Select, Textarea } from '../../components/ui/index.jsx';
import { dateLabel, id, StatusBadge, ViewTitle } from '../../components/shared/dashboard-primitives.jsx';

export function TeamTasksPage({ team, tasks, save, isAdmin, confirm }) {
  const [memberEditor, setMemberEditor] = useState(null);
  const [taskEditor, setTaskEditor] = useState(null);
  const memberFields = [
    { name: "name", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email" },
    {
      name: "role",
      label: "Role",
      options: [
        ["MCVP", "MCVP"],
        ["Team Leader", "Team Leader"],
        ["Content Creator", "Content Creator"],
        ["SMM", "SMM"],
        ["Reelsmaker", "Reelsmaker"],
        ["Video Editor", "Video Editor"],
      ],
    },
  ];
  const taskFields = [
    { name: "title", label: "Task title", required: true, full: true },
    { name: "desc", label: "Description", full: true, multiline: true },
    {
      name: "assignee",
      label: "Assigned to",
      options: [
        ["", "Unassigned"],
        ...team.map((member) => [member.name, member.name]),
      ],
    },
    { name: "due", label: "Due date", type: "date" },
    {
      name: "priority",
      label: "Priority",
      options: [
        ["low", "Low"],
        ["medium", "Medium"],
        ["high", "High"],
      ],
    },
    {
      name: "status",
      label: "Status",
      options: [
        ["todo", "To do"],
        ["doing", "In progress"],
        ["done", "Done"],
      ],
    },
  ];
  async function saveMember(form) {
    const member = { ...form, id: memberEditor.id || id("member") };
    await save(
      "team",
      memberEditor.id
        ? team.map((item) => (item.id === member.id ? member : item))
        : [...team, member],
    );
  }
  async function saveTask(form) {
    const task = {
      ...form,
      id: taskEditor.id || id("task"),
      created: taskEditor.created || Date.now(),
      priority: form.priority || "medium",
      status: form.status || "todo",
    };
    await save(
      "tasks",
      taskEditor.id
        ? tasks.map((item) => (item.id === task.id ? task : item))
        : [...tasks, task],
    );
  }
  async function deleteMember(member) {
    if (await confirm(`Remove ${member.name} from the team?`))
      await save(
        "team",
        team.filter((item) => item.id !== member.id),
      );
  }
  async function deleteTask(task) {
    if (await confirm(`Delete task “${task.title}”?`))
      await save(
        "tasks",
        tasks.filter((item) => item.id !== task.id),
      );
  }
  async function moveTask(task, status) {
    await save(
      "tasks",
      tasks.map((item) => (item.id === task.id ? { ...item, status } : item)),
    );
  }
  return (
    <div>
      {" "}
      <ViewTitle
        title="Team Workspace"
        description="Roles, members, tasks and assignments for the whole team."
      >
        {isAdmin && (
          <Button onClick={() => setMemberEditor({ role: "Content Creator" })}>
            ＋ Add member
          </Button>
        )}
      </ViewTitle>
      {!isAdmin && (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Only an MC admin can replace the team roster. Everyone can view the
          team and manage tasks.
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {team.length ? (
          team.map((member) => (
            <Card key={member.id} className="flex items-center gap-3 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-blue-700 font-bold text-white">
                {member.name?.[0]?.toUpperCase() || "?"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-slate-900">
                  {member.name}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {member.email}
                </p>
                <Badge color="blue">{member.role}</Badge>
              </div>
              {isAdmin && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="subtle"
                    onClick={() => setMemberEditor(member)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="subtle"
                    className="text-rose-600"
                    onClick={() => deleteMember(member)}
                  >
                    ×
                  </Button>
                </div>
              )}
            </Card>
          ))
        ) : (
          <EmptyState icon="◉" title="No team members yet" />
        )}
      </div>
      <div className="mb-4 mt-9 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Team tasks</h2>
          <p className="mt-1 text-xs text-slate-500">
            Assign work and track it from idea to done.
          </p>
        </div>
        <Button onClick={() => setTaskEditor({})}>＋ Add task</Button>
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        {[
          ["todo", "To do"],
          ["doing", "In progress"],
          ["done", "Done"],
        ].map(([status, title]) => {
          const column = tasks.filter((task) => task.status === status);
          return (
            <Card key={status} className="min-h-52 bg-slate-50/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-extrabold text-slate-800">{title}</h3>
                <Badge>{column.length}</Badge>
              </div>
              <div className="space-y-2">
                {column.length ? (
                  column.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-bold text-slate-800">
                          {task.title}
                        </p>
                        <StatusBadge>{task.priority}</StatusBadge>
                      </div>
                      {task.desc && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {task.desc}
                        </p>
                      )}
                      <p className="mt-2 text-[11px] text-slate-400">
                        {task.assignee || "Unassigned"}
                        {task.due ? ` · Due ${dateLabel(task.due)}` : ""}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1">
                        {status !== "todo" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              moveTask(
                                task,
                                status === "done" ? "doing" : "todo",
                              )
                            }
                          >
                            ←
                          </Button>
                        )}
                        {status !== "done" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              moveTask(
                                task,
                                status === "todo" ? "doing" : "done",
                              )
                            }
                          >
                            Move →
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="subtle"
                          onClick={() => setTaskEditor(task)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="subtle"
                          className="text-rose-600"
                          onClick={() => deleteTask(task)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-xs text-slate-400">
                    No tasks
                  </p>
                )}
              </div>
            </Card>
          );
        })}
      </div>
      {memberEditor && (
        <RecordForm
          key={memberEditor.id || "new-member"}
          title={memberEditor.id ? "Edit team member" : "Add team member"}
          initial={memberEditor}
          fields={memberFields}
          onSave={saveMember}
          onClose={() => setMemberEditor(null)}
        />
      )}
      {taskEditor && (
        <RecordForm
          key={taskEditor.id || "new-task"}
          title={taskEditor.id ? "Edit task" : "Add task"}
          initial={taskEditor}
          fields={taskFields}
          onSave={saveTask}
          onClose={() => setTaskEditor(null)}
        />
      )}
    </div>
  );
}
