# Polotno Frameworkless-like with BrandKit

## Development

Install dependencies:

```bash
npm install
```

Run the project:

```bash
npm run dev
```

You can make any edits you like. The brand kit feature is inside `/components/side-panel/brand-kit/` directory.
You can freely modify this component for your own brand and style requirements.

### Customizing the API

All communication with API is inside `/components/side-panel/brand-kit/api-context.ts` file.
For the demo it is using local IndexedDB. To connect to your own server, replace the `apiFetch()` function with real fetch calls to your backend API.

Example of replacing with a real API:

```typescript
async function apiFetch<T = any>(options: ApiFetchOptions): Promise<T> {
  const { path, method, body, params } = options;

  const url = new URL(`https://your-api.com${path}`);
  if (params) {
    Object.entries(params).forEach(([key, val]) =>
      url.searchParams.append(key, String(val))
    );
  }

  const response = await fetch(url.toString(), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
}
```

## Build

To finalize the editor and insert into your web app:

```bash
npm run build
```

The build output will be in `./dist/editor.js`. Deploy this file to your server and include it in your HTML page:

```html
<!-- add styles -->
<link
  href="https://unpkg.com/@blueprintjs/core@5/lib/css/blueprint.css"
  rel="stylesheet"
/>
<!-- add polotno bundle -->
<!-- (!) important: make sure it is added into body of document (not <head>) -->
<script src="./path-to-editor.js"></script>
<!-- set styles for the editor -->
<style>
  body {
    padding: 0;
    margin: 0;
  }
  #container {
    width: 100vw;
    height: 100vh;
  }
  /* optionally enable dark theme */
  /* body.bp5-dark { background: #1e1e1e; } */
  /* <body class="bp5-dark"> */
</style>
<!-- create container for editor -->
<div id="container"></div>
<!-- init the editor -->
<script>
  const { store } = createPolotnoApp({
    // this is a demo key just for that project
    // (!) please don't use it in your projects
    // to create your own API key please go here: https://polotno.com/cabinet
    key: 'KEY',
    // you can hide back-link on a paid license
    // but it will be good if you can keep it for Polotno project support
    showCredit: true,
    container: document.getElementById('container'),
    // also optionally you can specify which side panels you want to show
    // by default all panels are shown
    // sections: ['photos', 'text', 'elements', 'upload', 'background', 'layers']
  });
</script>
```
