This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Planning with OpenSpec

This repository uses [OpenSpec](https://openspec.dev/) for new change planning. Install the CLI (Node.js 20.19 or newer is required), then restart Codex so it discovers the repository skills:

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

In Codex, use `$openspec-explore` to shape an idea, `$openspec-propose` to create a complete proposal, specs, design, and task plan, and `$openspec-apply-change` in a later turn to implement an approved plan. Active changes and canonical specs are stored in `openspec/`. Existing files in `docs/superpowers/` remain as historical plans.

Useful CLI checks:

```bash
openspec list
openspec validate --all
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
