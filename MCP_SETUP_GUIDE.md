# MCP Setup Guide for Claude Code

## What is MCP?

**MCP (Model Context Protocol)** is a standard that allows Claude Code to connect to external tools and data sources. Think of it like plugins or extensions that give Claude Code new capabilities.

### What MCP Servers Can Do:
- Access external APIs (GitHub, Slack, etc.)
- Query databases
- Search the web
- Read documentation
- Access files outside your project
- And much more!

---

## Adding MCP Servers to Claude Code

### Basic Command Structure

```bash
claude mcp add <server-name> -- <command-to-run-server>
```

**Important:** Run these commands in your **terminal** (outside Claude Code), then **restart Claude Code**.

---

## Popular MCP Servers

### 1. **Filesystem** - Access files outside current project

```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /Users/twilightin
```

**What it does:**
- Read/write files outside your current project
- Useful for accessing files in other directories

**Example use:**
- "Read my notes from ~/Documents/notes.txt"
- "Search all my Python projects in ~/Projects"

---

### 2. **Brave Search** - Web search capability

```bash
# First, get a Brave Search API key from https://brave.com/search/api/
export BRAVE_API_KEY="your-api-key-here"

claude mcp add brave-search -- npx -y @modelcontextprotocol/server-brave-search
```

**What it does:**
- Search the web for current information
- Get real-time data (weather, news, etc.)

**Example use:**
- "Search for latest Next.js 16 documentation"
- "What's the current weather in Tokyo?"

---

### 3. **GitHub** - Access GitHub repositories

```bash
# First, create a GitHub token at https://github.com/settings/tokens
export GITHUB_TOKEN="your-github-token"

claude mcp add github -- npx -y @modelcontextprotocol/server-github
```

**What it does:**
- Create issues and PRs
- Search repositories
- Read repository contents
- Manage GitHub resources

**Example use:**
- "Create an issue in my repo about this bug"
- "Show me recent PRs in facebook/react"

---

### 4. **PostgreSQL** - Direct database queries

```bash
# Uses your existing DATABASE_URL
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres
```

**What it does:**
- Query your database directly
- Inspect schema
- Analyze data

**Example use:**
- "Show me all tables in my database"
- "What's the average completion rate of todos?"

**Note:** Your project already has database access via `lib/db.js`, so this is optional.

---

### 5. **SQLite** - SQLite database access

```bash
claude mcp add sqlite -- npx -y @modelcontextprotocol/server-sqlite --db-path /path/to/database.db
```

**What it does:**
- Query SQLite databases
- Good for local development databases

---

### 6. **Fetch** - HTTP requests and web scraping

```bash
claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch
```

**What it does:**
- Make HTTP requests
- Fetch web pages
- Access REST APIs

**Example use:**
- "Fetch data from this API endpoint"
- "Get the contents of this webpage"

---

### 7. **Puppeteer** - Browser automation

```bash
claude mcp add puppeteer -- npx -y @modelcontextprotocol/server-puppeteer
```

**What it does:**
- Automate browser tasks
- Take screenshots
- Test web applications

**Example use:**
- "Take a screenshot of my app running on localhost:3000"
- "Test the login flow on my website"

---

### 8. **Mastra Docs** - Documentation server

```bash
claude mcp add mastra -- npx -y @mastra/mcp-docs-server
```

**What it does:**
- Access Mastra framework documentation
- Search Mastra API references

---

## Verifying MCP Servers

After adding MCP servers and restarting Claude Code, check they're working:

```
/mcp
```

This will list all configured MCP servers and their status.

---

## Manual Configuration

If the `claude mcp add` command doesn't work, you can manually edit the configuration file:

### Location:
```
~/.claude/mcp.json
```

### Example Configuration:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/twilightin"]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key-here"
      }
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your-github-token"
      }
    },
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://localhost/todo_next"
      }
    }
  }
}
```

---

## Environment Variables for MCP Servers

### Option 1: Shell Configuration (Recommended)

Add to `~/.zshrc` or `~/.bashrc`:

```bash
# API Keys for MCP servers
export BRAVE_API_KEY="your-brave-api-key"
export GITHUB_TOKEN="your-github-token"
export DATABASE_URL="postgresql://localhost/todo_next"
```

Then reload:
```bash
source ~/.zshrc  # or source ~/.bashrc
```

### Option 2: .env File

Some MCP servers can read from `.env` files in your project directory.

### Option 3: Direct in mcp.json

Include `"env": {}` in the server configuration (shown above).

---

## Troubleshooting

### MCP Server Not Showing Up

**1. Restart Claude Code**
MCP servers only load on startup. Always restart after adding servers.

**2. Check Configuration**
```bash
cat ~/.claude/mcp.json
```

Verify JSON syntax is correct (no trailing commas, proper quotes).

**3. Check Command Works**
Test the npx command manually:
```bash
npx -y @modelcontextprotocol/server-filesystem /Users/twilightin
```

**4. Run Doctor**
```
/doctor
```

This diagnoses common issues with Claude Code setup.

---

### MCP Server Fails to Connect

**Check environment variables:**
```bash
echo $BRAVE_API_KEY
echo $GITHUB_TOKEN
```

**Check logs:**
Claude Code logs errors when MCP servers fail to start.

**Verify API keys:**
- Brave Search: https://brave.com/search/api/
- GitHub: https://github.com/settings/tokens (needs `repo` scope)

---

## Recommended Setup for Your Project

Based on your todo-next project and Python/FastAPI background:

### Essential:
```bash
# Filesystem access for multi-project work
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /Users/twilightin/TruthSetYouFree

# Web search for documentation/questions
claude mcp add brave-search -- npx -y @modelcontextprotocol/server-brave-search
```

### Nice to Have:
```bash
# GitHub integration
claude mcp add github -- npx -y @modelcontextprotocol/server-github

# Fetch for API testing
claude mcp add fetch -- npx -y @modelcontextprotocol/server-fetch
```

### Optional:
```bash
# Only if you want direct database queries beyond what lib/db.js provides
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres
```

---

## Security Considerations

### API Keys and Tokens

**Never commit API keys to git!**

```bash
# Add to .gitignore (global)
echo ".env" >> ~/.gitignore_global
git config --global core.excludesfile ~/.gitignore_global
```

### Filesystem Access

Be careful with filesystem MCP servers:
- Only give access to directories you trust
- Don't point at root directory (`/`)
- Use specific project folders

**Good:**
```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /Users/twilightin/TruthSetYouFree
```

**Bad:**
```bash
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /
```

---

## Using MCP Servers in Claude Code

Once configured, just ask naturally:

**With Filesystem MCP:**
- "Read the README from my Python FastAPI project"
- "Search for all .md files in my projects folder"

**With Brave Search:**
- "What's the weather in Tokyo right now?"
- "Search for Next.js 16 App Router documentation"

**With GitHub MCP:**
- "Create an issue in my repo about adding user authentication"
- "Show me the latest commits in vercel/next.js"

**With Postgres MCP:**
- "Show me the schema of my todos table"
- "What's the average completion rate?"

---

## Discovering More MCP Servers

### Official Registry:
https://github.com/modelcontextprotocol/servers

### Popular Community Servers:
- **Slack** - Send messages to Slack
- **Google Drive** - Access Google Drive files
- **Notion** - Read/write Notion pages
- **AWS** - Manage AWS resources
- **Docker** - Control Docker containers

### Browse all servers:
```bash
claude mcp
```

Then visit the documentation link provided.

---

## Advanced: Creating Your Own MCP Server

You can create custom MCP servers for your specific needs!

**Example use cases:**
- Connect to your company's internal API
- Access custom database
- Integrate with proprietary tools

**Resources:**
- https://docs.claude.com/en/docs/claude-code/mcp
- https://github.com/modelcontextprotocol/specification

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `claude mcp add <name> -- <command>` | Add new MCP server |
| `claude mcp list` | List all configured servers |
| `claude mcp remove <name>` | Remove an MCP server |
| `/mcp` | Check MCP status in Claude Code |
| `/doctor` | Diagnose Claude Code issues |

---

## Summary

MCP servers extend Claude Code's capabilities beyond the current project:
- ✅ **Start simple** - Add filesystem and brave-search
- ✅ **Add as needed** - Don't install everything at once
- ✅ **Secure your keys** - Use environment variables
- ✅ **Restart after changes** - MCP servers load on startup

Your current project works great without MCP, but they can enhance your workflow when working across multiple projects or needing external data.

---

**Next Steps:**
1. Try adding filesystem MCP to access files outside this project
2. Get a Brave API key for web search
3. Experiment with GitHub MCP if you use GitHub
4. Add more as you discover needs

Happy coding! 🚀
