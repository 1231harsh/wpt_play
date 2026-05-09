# Web Concepts Lab

An interactive learning app for HTML, CSS, JavaScript, AJAX, React, Node, and Express.

## What it does

- Shows a live browser preview on the left
- Shows editable code on the right
- Lets you switch topics like HTML tables, forms, flexbox, DOM manipulation, AJAX, React state, Node, and Express
- Includes a simple tutor panel for doubts
- Uses a real OpenAI model automatically if you set `OPENAI_API_KEY`

## Run it

```powershell
npm.cmd install
npm.cmd start
```

Then open [http://localhost:3000](http://localhost:3000).

## Optional AI tutor

Set environment variables before starting the app:

```powershell
$env:OPENAI_API_KEY="your_key_here"
$env:OPENAI_MODEL="gpt-4o-mini"
npm.cmd start
```

If no API key is set, the built-in fallback tutor still works.

## Deploy To Vercel

This project is configured to run on Vercel using `api/index.js` as the serverless entrypoint.

```powershell
vercel
vercel --prod
```

Or import the repository into Vercel from GitHub.
