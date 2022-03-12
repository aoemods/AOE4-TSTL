# Age of Empires 4 - TypeScript to Lua
Very experimental project to allow writing TypeScript for Age of Empires 4 modding using [TypeScriptToLua](https://typescripttolua.github.io/).

## Setup
- Change the `outPath` in `deploy.js` to your own project directory

## Usage
- `npm run build`: Converts the scripts in `scripts/` to a single Lua file
- `npm run deploy`: Copies the lua file to the project directory and does some necessary post-processing