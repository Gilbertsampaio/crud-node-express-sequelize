import React, { useEffect, useState, useCallback } from "react";
import api from "../../api/api";
import "./StoriesCarousel.css";
import StoryViewer from "./StoryViewer";
import useAuth from "../../context/useAuth";

export default function StoriesCarousel() {
  const [storiesByUser, setStoriesByUser] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState([]);
  const [startIndex, setStartIndex] = useState(0);
  const { user } = useAuth();

  const fetchStories = useCallback(async () => {
    try {
      const res = await api.get("/stories");
      const groupedMap = res.data.reduce((acc, story) => {
        const userId = story.user?.id ?? "unknown";
        if (!acc[userId]) acc[userId] = { user: story.user, stories: [] };

        // CORREÇÃO: Remova a sobrescrita do status 'viewed'.
        // Agora, o status de visualização virá diretamente da API.
        acc[userId].stories.push(story);

        return acc;
      }, {});

      const grouped = Object.values(groupedMap).map((g) => ({
        user: g.user,
        stories: g.stories.sort((a, b) => {
          const dateA = a.created_at ? new Date(a.created_at) : 0;
          const dateB = b.created_at ? new Date(b.created_at) : 0;
          return dateA - dateB;
        }),
      }));

      setStoriesByUser(grouped);
    } catch (err) {
      console.error("Erro ao buscar stories:", err);
    }
  }, []);

  const markStoryViewedLocally = useCallback((storyId) => {
    setStoriesByUser((prev) =>
      prev.map((group) => ({
        ...group,
        stories: group.stories.map((s) =>
          s.id === storyId ? { ...s, viewed: true } : s
        ),
      }))
    );
    setSelectedUserStories((prev) =>
      prev.map((s) => (s.id === storyId ? { ...s, viewed: true } : s))
    );
  }, []);

  const openUserStories = (group) => {
    setSelectedUserStories(group.stories);
    setStartIndex(0);
    setViewerOpen(true);
  };

  const closeViewerAndUpdate = useCallback(() => {
    setViewerOpen(false);
    fetchStories(); // Atualiza a lista do carrossel após o fechamento do visualizador
  }, [fetchStories]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  if (storiesByUser.length === 0) return null;

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  return (
    <>
      <div className="stories-carousel">
        {storiesByUser.map((group) => {
          // A verificação 'allViewed' agora depende dos dados da API
          const allViewed = group.stories.every((s) => s.viewed);
          return (
            <div
              key={group.user.id}
              className="story-item"
              onClick={() => openUserStories(group)}
            >
              <div className={`story-avatar-container ${allViewed ? "view" : ""}`}>
                <div className="div-container-avatar">
                  <div
                    className="story-avatar"
                    style={{ backgroundImage: user.id === group.user.id ? `url(${API_URL}/uploads/${user.image})` : `url(${API_URL}/uploads/${group.user.image})` }}
                  >
                  </div>
                </div>
              </div>
              <span className="story-name">{group.user.name}</span>
            </div>
          );
        })}
      </div>

      {viewerOpen && (
        <StoryViewer
          stories={selectedUserStories}
          startIndex={startIndex}
          onClose={closeViewerAndUpdate}
          onMarkViewed={markStoryViewedLocally}
        />
      )}
    </>
  );
}