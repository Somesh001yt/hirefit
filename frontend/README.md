# HireFit

> Paste a job description. Upload your resume. Get your match score, missing keywords, and an AI-rewritten resume as a PDF — in under 30 seconds.

![Next.js](https://img.shields.io/badge/Next.js_16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## Features

- **Match Score** — AI scores how well your resume fits the job description (0–100)
- **Keyword Gap Analysis** — Surfaces every skill and phrase the JD expects but your resume is missing
- **One-click AI Rewrite** — Rewrites your entire resume with missing keywords woven in naturally
- **PDF Export** — LaTeX-styled resume preview with raw source toggle and browser PDF download


## Stack

- **Framework** — Next.js 16 (App Router) with React 19
- **Language** — TypeScript
- **Styling** — Tailwind CSS v4 + inline design tokens
- **Fonts** — Manrope, JetBrains Mono
- **PDF** — Browser print API with LaTeX-styled HTML preview
- **Auth** — JWT via cookies with React Context

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add NEXT_PUBLIC_API_URL
npm run dev


