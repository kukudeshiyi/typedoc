import globby from 'globby';
import ts from 'typescript';
import doctrine from 'doctrine';
import chalk from 'chalk';

export interface Options {
  root: string;
}

export interface Params {
  root: Options['root'];
  pattern: string;
}

export interface Comment extends doctrine.Tag {}

export interface AnalysisItem {
  name: string;
  type: string;
  comment: Comment[];
  optional: boolean;
}

export interface AnalysisResults {
  [key: string]: AnalysisItem[];
}

export default async function typedoc(params: Params) {
  const { root, pattern } = params;
  const options = {
    root: root || process.cwd(),
  };

  if (!pattern) {
    console.log(chalk.red(createStdout(`params error: pattern is required`)));
    process.exit(1);
  }

  let handlePattern = '';

  try {
    handlePattern = JSON.parse(pattern);
  } catch (e) {}

  if (!Array.isArray(handlePattern) || handlePattern.length <= 0) {
    console.log(chalk.red(createStdout(`params error: pattern must be array`)));
    process.exit(1);
  }

  // matching files
  const files = await matchFiles(handlePattern, options);

  console.log(chalk.blue(createStdout('found files:', files.join('\n'))));

  // static analysis
  staticAnalysis(files);
}

async function matchFiles(pattern: string[], { root }: Options) {
  return globby(pattern, {
    cwd: root,
  });
}

function staticAnalysis(files: string[]) {
  const program = ts.createProgram(files, {
    jsx: ts.JsxEmit.ReactNative,
    allowJs: false,
  });
  const sourceFiles = program.getSourceFiles().filter((sourceFile) => {
    return files.includes(sourceFile.fileName);
  });

  const results: AnalysisResults = {};
  let currentSourceFile: ts.SourceFile | undefined;

  sourceFiles.forEach((sourceFile) => {
    currentSourceFile = sourceFile;
    ts.forEachChild(sourceFile, collect);
  });

  function collect(node: ts.Node) {
    const result: AnalysisItem[] = parse(node);
    if (result.length > 0) {
      results[currentSourceFile?.fileName || ''] = result;
    }
  }

  function parse(node: ts.Node) {
    if (
      ts.isInterfaceDeclaration(node) &&
      node.name.escapedText === 'PropTypes'
    ) {
      const members = node.members;
      return members
        .filter((member) => ts.isPropertySignature(member))
        .map((member) => {
          try {
            const fullText = member.getFullText(currentSourceFile);
            const text = member.getText(currentSourceFile);
            const comment = fullText.replace(text, '').trim();

            const isOptional = !!member.questionToken;
            const separate = isOptional ? '?:' : ':';
            const [name = '', type = ''] = text.split(separate);
            return {
              name: name.trim(),
              type: type.trim().replace(/[,;]/g, ''),
              comment: parseComment(comment),
              optional: isOptional,
            };
          } catch (e) {}
          return {
            name: '',
            type: '',
            comment: [],
            optional: false,
          };
        });
    }
    return [];
  }

  return results;
}

function parseComment(commentStr: string) {
  const parseComment = doctrine.parse(commentStr, {
    unwrap: true,
  });
  const { description = '', tags = [] } = parseComment;
  if (tags.length >= 0) {
    return tags;
  }
  if (description) {
    return [
      {
        title: 'description',
        description,
      },
    ];
  }
  return [];
}

function createStdout(title: string, body?: string) {
  return `\n[typedoc]${title}\n${body || ''}\n`;
}
