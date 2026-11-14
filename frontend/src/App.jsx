
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreatePost from "./pages/CreatePost";
import Post from "./pages/Post";
import MyPosts from "./pages/MyPosts";
import Bookmarks from "./pages/Bookmarks";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/post" element={<Post />} />
            <Route path="/my-posts" element={<MyPosts />} />
            <Route path="/bookmarks" element={<Bookmarks />} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
}

export default App;
