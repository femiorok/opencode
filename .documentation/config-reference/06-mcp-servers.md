# MCP Servers

MCP (Model Context Protocol) servers extend OpenCode with additional tools and capabilities by connecting to external services.

## `mcp`

**Type:** `Record<string, McpConfig>`

MCP servers come in two types: **local** (runs as a subprocess) and **remote** (connects to a URL).

---

## Local MCP Server

Local servers run as child processes. OpenCode starts them when needed and communicates via stdio.

```json
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem", "/home/user/documents"],
      "environment": {
        "NODE_OPTIONS": "--max-old-space-size=4096"
      },
      "enabled": true,
      "timeout": 5000
    }
  }
}
```

### Local Server Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `type` | `"local"` | Yes | Identifies this as a local server |
| `command` | `string[]` | Yes | Command and arguments to start the server. First element is the executable, rest are arguments. |
| `environment` | `Record<string, string>` | No | Environment variables to set when running the server |
| `enabled` | `boolean` | No | Set to `false` to disable without removing config. Default: `true` |
| `timeout` | `number` | No | Timeout in milliseconds for fetching tools from the server. Default: 5000 (5 seconds) |

### Common Local MCP Servers

- `@modelcontextprotocol/server-filesystem` — File system access
- `@modelcontextprotocol/server-github` — GitHub API integration
- `@modelcontextprotocol/server-postgres` — PostgreSQL database access
- `@modelcontextprotocol/server-slack` — Slack integration
- `@modelcontextprotocol/server-memory` — Persistent memory/knowledge base

---

## Remote MCP Server

Remote servers connect to an HTTP endpoint, useful for shared services or cloud-hosted tools.

```json
{
  "mcp": {
    "company-tools": {
      "type": "remote",
      "url": "https://mcp.company.com/tools",
      "headers": {
        "Authorization": "Bearer {env:MCP_TOKEN}",
        "X-Team-ID": "engineering"
      },
      "oauth": {
        "clientId": "opencode-client",
        "scope": "tools:read tools:execute"
      },
      "enabled": true,
      "timeout": 10000
    }
  }
}
```

### Remote Server Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `type` | `"remote"` | Yes | Identifies this as a remote server |
| `url` | `string` | Yes | Full URL of the MCP server endpoint |
| `headers` | `Record<string, string>` | No | HTTP headers sent with every request |
| `oauth` | `McpOAuthConfig \| false` | No | OAuth configuration (see below). Set to `false` to disable OAuth auto-detection. |
| `enabled` | `boolean` | No | Set to `false` to disable. Default: `true` |
| `timeout` | `number` | No | Request timeout in milliseconds. Default: 5000 |

---

## OAuth Configuration

If your MCP server requires OAuth authentication:

```json
{
  "oauth": {
    "clientId": "my-client-id",
    "clientSecret": "{env:OAUTH_SECRET}",
    "scope": "read write execute"
  }
}
```

| Option | Type | Description |
|--------|------|-------------|
| `clientId` | `string` | OAuth client ID. If not provided, OpenCode attempts dynamic client registration (RFC 7591). |
| `clientSecret` | `string` | OAuth client secret, if required by the authorization server. |
| `scope` | `string` | Space-separated OAuth scopes to request. |

Set `oauth: false` to disable OAuth entirely (useful when using API keys in headers instead).

---

## Practical Examples

### GitHub Integration
```json
{
  "mcp": {
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "environment": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "{env:GITHUB_TOKEN}"
      }
    }
  }
}
```

### Database Access
```json
{
  "mcp": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "environment": {
        "DATABASE_URL": "{env:DATABASE_URL}"
      },
      "timeout": 10000
    }
  }
}
```

### Custom Internal Tools
```json
{
  "mcp": {
    "internal-tools": {
      "type": "remote",
      "url": "https://tools.internal.company.com/mcp",
      "headers": {
        "Authorization": "Bearer {env:INTERNAL_API_KEY}"
      },
      "oauth": false
    }
  }
}
```

---

## Troubleshooting

**Server not starting:**
- Check that the command is correct and the package is installed
- Verify environment variables are set
- Increase timeout if the server is slow to start

**Tools not appearing:**
- Ensure `enabled` is not set to `false`
- Check OpenCode logs for connection errors
- Verify the server is responding correctly

**Authentication failures:**
- Double-check API keys and tokens
- For OAuth, verify client ID and scopes
- Check if the token has expired
