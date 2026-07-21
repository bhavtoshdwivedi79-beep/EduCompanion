import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import Notes from "./pages/Notes";
import Quiz from "./pages/Quiz";
import SavedNotes from "./pages/SavedNotes";
import MainLayout from "./layouts/MainLayout";
import QuizHistory from "./pages/QuizHistory";
import ChatHistory from "./pages/ChatHistory";

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        {/* Protected Layout */}

        <Route element={<MainLayout />}>

          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/chat" element={<AIChat />} />

          <Route path="/notes" element={<Notes />} />

          <Route path="/quiz" element={<Quiz />} />

          <Route path="/saved-notes" element={<SavedNotes />} />

          <Route path="/quiz-history" element={<QuizHistory />} />

          <Route path="/chat-history" element={<ChatHistory />} />

        </Route>

      </Routes>

    </BrowserRouter>

  );

}

export default App;