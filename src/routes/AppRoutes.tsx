import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Layout from "../components/layout/Layout";
import TeacherAreaLayout from "../components/layout/TeacherAreaLayout";
import Discipline from "../pages/Discipline";
import Home from "../pages/Home";
import PostView from "../pages/PostView";
import SearchResults from "../pages/SearchResults";
import Login from "../pages/Login";
import About from "../pages/About";
import Teachers from "../pages/Teachers";
import Methodology from "../pages/Methodology";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfUse from "../pages/TermsOfUse";
import TeacherDashboard from "../pages/TeacherDashboard";
import TeacherPosts from "../pages/TeacherPosts";
import TeacherPostForm from "../pages/TeacherPostForm";
import RequireAuth from "./RequireAuth";
import NotFound from "../pages/NotFound";
import RequireRole from "./RequireRole";
import Profile from "../pages/Profile";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },

  {
    element: <RequireAuth />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: "/", element: <Home /> },
          { path: "/conteudo/:disciplina", element: <Discipline /> },
          { path: "/posts/:id", element: <PostView /> },
          { path: "/busca", element: <SearchResults /> },
          { path: "*", element: <NotFound /> },
          { path: "/sobre", element: <About /> },
          { path: "/professores", element: <Teachers /> },
          { path: "/metodologia", element: <Methodology /> },
          { path: "/politica-de-privacidade", element: <PrivacyPolicy /> },
          { path: "/termos-de-uso", element: <TermsOfUse /> },
          { path: "/perfil", element: <Profile /> },
          {
            element: <RequireRole role="PROFESSOR" />,
            children: [
              {
                element: <TeacherAreaLayout />,
                children: [
                  {
                    path: "/professor",
                    element: <Navigate to="/professor/dashboard" replace />,
                  },
                  {
                    path: "/professor/dashboard",
                    element: <TeacherDashboard />,
                  },
                  { path: "/professor/posts", element: <TeacherPosts /> },
                  {
                    path: "/professor/posts/new",
                    element: <TeacherPostForm key="new" />,
                  },
                  {
                    path: "/professor/posts/:id/edit",
                    element: <TeacherPostForm key="edit" />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}
