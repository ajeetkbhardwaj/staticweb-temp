# Static Site

A Hugo-based static site for the Beta.PyjamaCafe coding platform.

## Run locally

```bash
cd /workspaces/staticweb-temp
hugo server --bind 0.0.0.0 --port 1313 --disableFastRender
```

Then open the site in your browser:

```
http://localhost:1313/
```

## Forward the port (remote/cloud workspace)

If you are running inside a remote or cloud workspace (VS Code Server,
GitHub Codespaces, etc.):

1. Open the **Ports** panel in VS Code.
2. Add port **1313** (or click the auto-detected prompt).
3. Open the forwarded URL in your browser, e.g.:

```
https://<your-workspace>-1313.<provider>.dev/
```

## Check that it is running

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:1313/
```

You should see `HTTP 200`.

## Build for production

```bash
hugo
```

The site is generated into the `public/` folder.

## Stop the server

Press `Ctrl+C` in the terminal where `hugo server` is running.
