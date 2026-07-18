# Real-Time Collaboration Implementation Plan

> **For agentic workers:** Implement task-by-task. Redis intentionally deferred.

**Goal:** End-to-end real-time collab (presence, cursors, search, meals, portions, activity, DB locks) across Find Food, Recall, and Admin — in-memory hub only.

**Architecture:** Go WebSocket Hub (existing) + Next.js collab domain (Zustand + hooks). JWT via `?token=` for browser WS. No Redis.

**Tech Stack:** Go/Gin + gorilla/websocket, Next.js, Zustand, native WebSocket

## Tasks

- [x] BE: JWT query token + context key fix
- [x] BE: Full message protocol + in-memory locks + presence sync
- [x] FE: collab types/store/useWebSocket
- [x] FE: UI (bar, avatars, cursors, activity, lock)
- [x] Integrate find-food, recall, admin foods
- [x] Verify typecheck / smoke
