## Guidelines

### Enviroment

When executing tasks, check if there is SO env called WORKSPACE, if not, export one
for the current session that has as value the initial value of pwd of the currrent workspace.

### Node.js
- We use version 24, if needed search documentation in [node js documentation](https://nodejs.org/api/all.html)
- We use pnpm version 10 as pacakge manager, documentation [here](https://pnpm.io/)
- Implementations by default of HTTP request should be with web fetch API from browsers, even thoug we are using node as runtime, nodejs 24 has a estable implementation of fetch tehre is no need to import node-fetch or axios if not told.

### Toolchain
#### Libraries

For creating libraires we should use 
```bash
pnpm create rslib@latest 
```

And they shoudl be created inside `<workspace root>/packages`

### Architecture

- We use dependency injection.
- We code in TS as default.