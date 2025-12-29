# Server Settings

## `server`

**Type:** `ServerConfig`

Configuration for `opencode serve` (headless API server) and `opencode web` (web interface).

```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true
  }
}
```

---

## Options

### `port`

**Type:** `number`

TCP port to listen on.

```json
{
  "server": {
    "port": 8080
  }
}
```

Choose a port that doesn't conflict with other services. Common choices:
- `4096`: OpenCode default
- `8080`: Common alternative HTTP port
- `3000`: Common for development servers

---

### `hostname`

**Type:** `string`

IP address or hostname to bind to.

```json
{
  "server": {
    "hostname": "127.0.0.1"
  }
}
```

**Common values:**

| Value | Access |
|-------|--------|
| `"127.0.0.1"` or `"localhost"` | Only accessible from local machine |
| `"0.0.0.0"` | Accessible from any network interface |
| Specific IP (e.g., `"192.168.1.100"`) | Only accessible via that IP |

**Security note:** Using `"0.0.0.0"` exposes the server to your entire network. Only use this on trusted networks.

**Default behavior:** When `mdns` is enabled and no hostname is set, defaults to `"0.0.0.0"` to allow network discovery.

---

### `mdns`

**Type:** `boolean`
**Default:** `false`

Enable mDNS (multicast DNS) service discovery.

```json
{
  "server": {
    "mdns": true
  }
}
```

**What it does:**
- Broadcasts the OpenCode server on your local network
- Other devices can discover and connect to it automatically
- The server appears as `opencode.local` (or similar)

**Use cases:**
- Access the web UI from your phone or tablet
- Connect from another computer on your network
- Share your session with others on the same network

**Requirements:**
- Must be on a network that supports mDNS
- Hostname must be set to `"0.0.0.0"` or a network-accessible address
- Firewall must allow mDNS traffic (port 5353 UDP)

---

## Usage Examples

### Local-Only Server (Most Secure)

```json
{
  "server": {
    "port": 4096,
    "hostname": "127.0.0.1"
  }
}
```

Only accessible from the same machine.

### Network-Accessible with Discovery

```json
{
  "server": {
    "port": 4096,
    "hostname": "0.0.0.0",
    "mdns": true
  }
}
```

Accessible from any device on your local network, discoverable via mDNS.

### Specific Network Interface

```json
{
  "server": {
    "port": 4096,
    "hostname": "192.168.1.50"
  }
}
```

Only accessible via the specified IP address.

---

## Running the Server

**Start headless API server:**
```bash
opencode serve
```

**Start with web interface:**
```bash
opencode web
```

Both commands respect the `server` configuration.
