import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voice Notes",
  description: "Record, transcribe, and organize voice notes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #e5e5e5;
            min-height: 100vh;
          }

          .app {
            max-width: 1600px;
            margin: 0 auto;
            padding: 1rem;
          }

          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid #222;
            margin-bottom: 1.5rem;
          }

          .header h1 {
            font-size: 1.5rem;
            font-weight: 600;
          }

          .btn {
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            font-weight: 500;
            transition: all 0.2s;
          }

          .btn-record {
            background: #1a1a2e;
            color: #fff;
            border: 1px solid #333;
          }
          .btn-record:hover { background: #2a2a3e; }
          .btn-record:disabled { opacity: 0.5; }

          .btn-stop {
            background: #dc2626;
            color: #fff;
            animation: pulse 1s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }

          /* Groups Grid */
          .groups-grid {
            display: flex;
            gap: 1rem;
            overflow-x: auto;
            padding-bottom: 1rem;
          }

          .group-column {
            min-width: 280px;
            max-width: 320px;
            background: #111;
            border-radius: 12px;
            padding: 1rem;
            flex-shrink: 0;
          }

          .group-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid #222;
          }

          .group-name {
            font-weight: 600;
            font-size: 0.9rem;
            flex: 1;
          }

          .group-count {
            background: #222;
            padding: 0.2rem 0.6rem;
            border-radius: 12px;
            font-size: 0.75rem;
            color: #888;
          }

          .delete-group {
            background: none;
            border: none;
            color: #666;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0 0.25rem;
          }
          .delete-group:hover { color: #dc2626; }

          .tasks-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
          }

          .task-card {
            background: #1a1a1a;
            border: 1px solid #222;
            border-radius: 8px;
            padding: 0.75rem;
            cursor: grab;
            transition: all 0.2s;
          }
          .task-card:hover {
            border-color: #333;
            transform: translateY(-1px);
          }
          .task-card.selected {
            border-color: #3b82f6;
            box-shadow: 0 0 0 1px #3b82f6;
          }
          .task-card.dragging { opacity: 0.4; }

          .task-title {
            font-weight: 500;
            font-size: 0.9rem;
            margin-bottom: 0.25rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .task-preview {
            font-size: 0.8rem;
            color: #666;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            margin-bottom: 0.5rem;
          }

          .task-meta {
            font-size: 0.75rem;
            color: #555;
            display: flex;
            gap: 0.5rem;
          }

          /* Add Group Column */
          .add-group-column {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            background: transparent;
            border: 2px dashed #222;
          }
          .add-group-column input {
            background: #111;
            border: 1px solid #222;
            padding: 0.5rem;
            border-radius: 6px;
            color: #e5e5e5;
            font-size: 0.9rem;
          }
          .add-group-column button {
            background: #222;
            border: none;
            padding: 0.5rem;
            border-radius: 6px;
            color: #e5e5e5;
            cursor: pointer;
          }
          .add-group-column button:disabled { opacity: 0.3; }

          /* Modal */
          .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 100;
          }

          .modal {
            background: #111;
            border: 1px solid #222;
            border-radius: 16px;
            padding: 1.5rem;
            min-width: 320px;
            max-width: 90vw;
          }

          .modal h3 {
            margin-bottom: 1rem;
            font-size: 1.1rem;
          }

          .group-picker {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .group-btn {
            background: #1a1a2e;
            border: 1px solid #333;
            padding: 0.6rem 1rem;
            border-radius: 20px;
            color: #e5e5e5;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
          }
          .group-btn:hover { background: #2a2a4e; border-color: #3b82f6; }
          .group-btn:disabled { opacity: 0.5; }

          .new-group {
            display: flex;
            gap: 0.5rem;
          }
          .new-group input {
            flex: 1;
            background: #0a0a0a;
            border: 1px solid #222;
            padding: 0.5rem;
            border-radius: 6px;
            color: #e5e5e5;
          }
          .new-group button {
            background: #222;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            color: #e5e5e5;
            cursor: pointer;
          }

          .uploading {
            margin-top: 1rem;
            color: #888;
            text-align: center;
          }

          /* Preview Panel */
          .preview-panel {
            position: fixed;
            right: 0;
            top: 0;
            bottom: 0;
            width: 380px;
            background: #111;
            border-left: 1px solid #222;
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            z-index: 50;
            overflow-y: auto;
          }

          .close-preview {
            position: absolute;
            right: 1rem;
            top: 1rem;
            background: none;
            border: none;
            color: #666;
            font-size: 1.5rem;
            cursor: pointer;
          }

          .preview-title {
            background: #0a0a0a;
            border: 1px solid #222;
            padding: 0.75rem;
            border-radius: 8px;
            color: #e5e5e5;
            font-size: 1rem;
            font-weight: 500;
          }

          .preview-panel audio {
            width: 100%;
            border-radius: 8px;
          }

          .preview-panel img {
            width: 100%;
            border-radius: 8px;
          }

          .preview-panel textarea {
            background: #0a0a0a;
            border: 1px solid #222;
            padding: 0.75rem;
            border-radius: 8px;
            color: #e5e5e5;
            font-size: 0.9rem;
            min-height: 150px;
            resize: vertical;
          }

          .preview-panel select {
            background: #0a0a0a;
            border: 1px solid #222;
            padding: 0.75rem;
            border-radius: 8px;
            color: #e5e5e5;
            font-size: 0.9rem;
          }

          .btn-delete {
            background: #1a0a0a;
            border: 1px solid #331a1a;
            padding: 0.75rem;
            border-radius: 8px;
            color: #dc2626;
            cursor: pointer;
            margin-top: auto;
          }
          .btn-delete:hover { background: #2a1a1a; }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
