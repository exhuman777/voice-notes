# Kanban Dump

Simple file-based task board for Claude Code integration.

## Quick Commands

```bash
./task add "Task title"    # Add task
./task list                # View board
./task done <id>           # Complete task
./task progress <id>       # Mark in progress
```

## Claude Code Integration

Use `/task` command:
- `/task add Fix the bug`
- `/task list`
- `/task done abc123`

Or just tell me naturally: "add task: review PR #42" and I'll run the CLI.

## Structure

- `tasks.json` - All tasks (syncs with web UI)
- `uploads/` - Dropped files
- `npm run dev` - Web UI at localhost:3000
- `npm run watch` - Auto-add files dropped in uploads/

## File Dump

Drop any file in web UI or `uploads/` folder → becomes task.
Audio files get transcribed if whisper installed.
