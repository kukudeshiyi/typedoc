// #!/usr/bin/env node

const sade = require('sade');
const pkg = require('./package.json');
const typedoc = require('./lib/index.js').default;

sade('typedoc', true)
  .version(pkg.version)
  .describe(`${pkg.description}\r\n`)
  .example(
    `typedoc --pattern --pattern '["packages/+([A-Za-z])-component/src/**/*.tsx"]'`
  )
  .option('-p,pattern', 'file pattern')
  .example('typedoc --root /Users/user/project')
  .option('-r,root', 'cli work path')
  .action(({ root, pattern }) => {
    typedoc({
      root: root || '',
      pattern: pattern || '',
    });
  })
  .parse(process.argv, {});
