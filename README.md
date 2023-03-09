This is an Arweave + [Next.js](https://nextjs.org/) project template.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Build & Deploy with Bundlr

Once you've built your Next.js application, you can deploy it with bundlr using the `upload-dir` command, a pointer to the index file and other the required arguments, which will configure a path manifest for you. You can read more about how to deploy with bundlr in their [docs](https://docs.bundlr.network)

## Relative path support

Currently, if you want to have support for relative paths, you will need to omit the `/` when using relative paths to assets in the `public` folder. So instead of referencing an svg at `public/thirteen.svg` by using `/thirteen.svg` in the `src` attribute, you would instead just use `thirteen.svg`.

We're also working on a script that will remove any prefixed slashes within relative paths at build time, so you don't have to worry about removing slashes manually.

## Learn More about Arweave

To learn more about Arweave and the Permaweb, take a look at the following resources:

- [Permaweb Cookbook](https://cookbook.arweave.dev/) - A curated collection of developers guides & more to build on the Permaweb.
- [Arwiki](https://arwiki.wiki/) - An in-depth guide about the Arweave Protocol.

If you've never heard of Arweave, you can check out [the Arweave website](https://www.arweave.org/) for a quick introduction to the technology.
