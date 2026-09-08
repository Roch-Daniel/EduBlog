import { NavLink, Outlet } from "react-router-dom";

export default function TeacherAreaLayout() {
  const baseItemClass =
    "block border-l-3 border-transparent px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-700";

  return (
    <div className="grid w-full flex-1 grid-cols-1 border-t border-slate-200 bg-slate-50 text-slate-800 md:grid-cols-[280px_1fr]">
      <aside className="border-r border-slate-200 bg-white py-6 md:min-h-full">
        <nav className="flex flex-col">
          <NavLink
            to="/professor/dashboard"
            className={({ isActive }) =>
              `${baseItemClass} ${isActive ? "border-teal-700 bg-teal-50 text-teal-700" : ""}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/professor/posts"
            end
            className={({ isActive }) =>
              `${baseItemClass} ${isActive ? "border-teal-700 bg-teal-50 text-teal-700" : ""}`
            }
          >
            Meus Posts
          </NavLink>
          <NavLink
            to="/professor/posts/new"
            className={({ isActive }) =>
              `${baseItemClass} ${isActive ? "border-teal-700 bg-teal-50 text-teal-700" : ""}`
            }
          >
            Novo Post
          </NavLink>
        </nav>
      </aside>

      <main className="bg-slate-50 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
