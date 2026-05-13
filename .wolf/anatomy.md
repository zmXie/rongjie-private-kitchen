# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-13T04:32:13.982Z
> Files: 78 tracked | Anatomy hits: 0 | Misses: 0

## ./

- `.gitignore` — Git ignore rules (~18 tok)
- `CLAUDE.md` — OpenWolf (~595 tok)
- `deploy.js` — fs: run, readFile, checkWranglerConfig + 5 more (~1909 tok)
- `package-lock.json` — npm lock file (~33211 tok)
- `package.json` — Node.js package manifest (~154 tok)
- `README.md` — Project documentation (~482 tok)

## .claude/

- `CLAUDE.md` — CLAUDE.md (~180 tok)
- `settings.json` (~441 tok)

## .claude/rules/

- `architecture.md` — 架构说明 (~717 tok)
- `coding-style.md` — 开发规范 (~226 tok)
- `components.md` — 组件规范 (~366 tok)
- `openwolf.md` (~313 tok)
- `project-config.md` — 项目配置 (~262 tok)

## api/

- `.dev.vars` (~5 tok)
- `package-lock.json` — npm lock file (~15764 tok)
- `package.json` — Node.js package manifest (~114 tok)
- `tsconfig.json` — TypeScript configuration (~94 tok)
- `wrangler.toml` (~116 tok)

## api/.wrangler/state/v3/cache/miniflare-CacheObject/

- `metadata.sqlite-shm` (~8739 tok)
- `metadata.sqlite-wal` (~2206 tok)

## api/.wrangler/state/v3/d1/miniflare-D1DatabaseObject/

- `metadata.sqlite-shm` (~8738 tok)
- `metadata.sqlite-wal` (~2206 tok)

## api/.wrangler/state/v3/r2/miniflare-R2BucketObject/

- `metadata.sqlite-shm` (~8738 tok)
- `metadata.sqlite-wal` (~2206 tok)

## api/.wrangler/state/v3/r2/rongjie-images/blobs/

- `0f9a75e96dcaa6c322d981112888f2fc129060cfd78c8ecde7894705728c72200000019e1686254f` (~35687 tok)
- `4479dd225fbeb1a7de3edcc76805f26f02caf678f5378639af11f2f44d517bf40000019e1aff79b5` (~11260 tok)
- `4e5c7c0c1cc3f98ade866b20f985b890478418f83af0f11a463e4fe97fbe8cb30000019e1af5b0c3` (~11260 tok)
- `7545829dca8516a0e3755a25aa67b468f23ed520daa702bb16f4a4d4c312dd170000019e1b02494d` (~11260 tok)
- `bbe2af70846a78fa57f665d17bce76ac9b296413e5279af12be14a5f999e86cd0000019e1b009a34` (~11260 tok)
- `e104002cb8435bd29e932993783ea1fb61f52e1c94a0a5ed6edd63bf8c0ac81a0000019e1b019391` (~11260 tok)
- `e8659c4be0584cfe18478f02ccc2fe14b6fd8bd02fef1f524c247611672cd0c20000019e15a39067` (~146 tok)
- `eba1f9ba04d91e87fe5b1794e3ef8e8434831815285c2ad39a5cba6f108442f30000019e1b6accff` (~11260 tok)

## api/.wrangler/tmp/bundle-oK3RVf/

- `checked-fetch.js` — urls: checkURL (~238 tok)
- `middleware-insertion-facade.js` — Exports __INTERNAL_WRANGLER_MIDDLEWARE__ (~186 tok)
- `middleware-loader.entry.ts` — This loads all middlewares exposed on the middleware object and then starts (~1189 tok)
- `strip-cf-connecting-ip-header.js` — API routes: DELETE (1 endpoints) (~101 tok)

## api/.wrangler/tmp/bundle-zocpG2/

- `checked-fetch.js` — urls: checkURL (~238 tok)
- `middleware-insertion-facade.js` — Exports __INTERNAL_WRANGLER_MIDDLEWARE__ (~183 tok)
- `middleware-loader.entry.ts` — This loads all middlewares exposed on the middleware object and then starts (~1188 tok)
- `strip-cf-connecting-ip-header.js` — API routes: DELETE (1 endpoints) (~101 tok)

## api/.wrangler/tmp/dev-DU9BZY/

- `index.js` — Creates an instance of `HTTPException`. (~59947 tok)
- `index.js.map` — \n   * Creates an instance of `HTTPException`.\n   * @param status - HTTP status code for the exception. Defaults to 500.\n   * @param options - Ad... (~107192 tok)

## api/.wrangler/tmp/dev-jxLdgw/

- `index.js` — Creates an instance of `HTTPException`. (~59855 tok)
- `index.js.map` — \n   * Creates an instance of `HTTPException`.\n   * @param status - HTTP status code for the exception. Defaults to 500.\n   * @param options - Ad... (~106827 tok)

## api/src/

- `index.ts` — API routes: GET, POST, PUT, DELETE (13 endpoints) (~2588 tok)

## database/

- `init.sql` — Create categories table (~479 tok)
- `migrate.sql` — 为现有数据库添加 is_recommended 和 is_sold_out 字段 (~84 tok)

## web/

- `index.html` — 蓉姐私房菜 (~148 tok)
- `package-lock.json` — npm lock file (~17139 tok)
- `package.json` — Node.js package manifest (~146 tok)
- `tsconfig.json` — TypeScript configuration (~185 tok)
- `tsconfig.node.json` (~67 tok)
- `vite.config.ts` — Vite build configuration (~110 tok)

## web/functions/api/

- `[[path]].ts` — Exports onRequest (~396 tok)

## web/public/

- `_headers` (~83 tok)

## web/src/

- `App.vue` — Vue: setup, TS (~625 tok)
- `main.ts` — Declares app (~78 tok)
- `vite-env.d.ts` — / <reference types="vite/client" /> (~55 tok)

## web/src/api/

- `categories.ts` — Exports getCategories, createCategory, updateCategory, deleteCategory (~150 tok)
- `config.ts` — Exports getConfig (~46 tok)
- `dishes.ts` — Exports getDishes, createDish, updateDish, deleteDish, uploadImage (~277 tok)
- `index.ts` — Declares api (~231 tok)

## web/src/components/

- `CategoryEditor.vue` — Vue: setup, TS, emits (~630 tok)
- `DishCard.vue` — Vue: setup, TS, emits (~745 tok)
- `DishEditor.vue` — Vue: setup, TS, emits (~1372 tok)
- `ImageUploader.vue` — Vue: setup, TS, emits (~1122 tok)
- `LoadingState.vue` — Vue: setup, TS, 1 props (~104 tok)
- `LoginDialog.vue` — Vue: setup, TS, emits (~644 tok)
- `PageContainer.vue` — Vue: setup (~293 tok)

## web/src/composables/

- `useAdmin.ts` — API routes: GET (1 endpoints) (~163 tok)
- `useApi.ts` — Exports useApi (~226 tok)

## web/src/router/

- `index.ts` — Declares router (~118 tok)

## web/src/stores/

- `admin.ts` — Exports useAdminStore (~248 tok)
- `categories.ts` — Exports useCategoryStore (~488 tok)
- `dishes.ts` — Exports useDishStore (~525 tok)

## web/src/types/

- `index.ts` — Exports Category, Dish, ApiResponse (~122 tok)

## web/src/views/

- `DishDetail.vue` — Vue: setup (~1447 tok)
- `HomePage.vue` — Vue: dish-detail, setup (~2536 tok)
