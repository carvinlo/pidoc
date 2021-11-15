#!/usr/bin/env node

const yargs = require('yargs');
const { apps } = require('piral-cli');
const { prepare, copyStatic, getDefault } = require('../src/tools/cli');
const { outputPath, bundlerName, package } = require('../src/tools/meta-core');

const baseDir = process.cwd();
const entry = package.source || getDefault(baseDir, `./src/index.tsx`);
const target = `${outputPath}/index.js`;
const app = package.piral ? package.piral.name : undefined;

yargs
  .command(
    ['run', 'debug', 'watch'],
    'Starts a debug session of your documentation pilet.',
    (argv) => {
      return argv
        .number('port')
        .describe('port', 'The port to use for the webserver.')
        .default('port', 1234)
        .string('feed')
        .describe('feed', 'A potential feed to mix in for development.')
        .default('feed', undefined)
        .boolean('open')
        .describe('open', 'Opens the URL in your webbrowser.')
        .default('open', true)
        .number('log-level')
        .describe('log-level', 'The log level to use (0-5).')
        .default('log-level', 3);
    },
    (args) => {
      prepare(baseDir);
      return apps
        .debugPilet(baseDir, {
          entry,
          target,
          bundlerName,
          feed: args.feed,
          logLevel: args['log-level'],
          app,
          open: args.open,
          port: args.port,
          hooks: {
            afterBuild() {
              copyStatic(outputPath);
            },
          },
        })
        .then(
          () => process.exit(0),
          (err) => {
            console.error(err);
            process.exit(1);
          },
        );
    },
  )
  .command(
    ['$0', 'bundle', 'build'],
    'Builds the release assets for your documentation pilet.',
    (argv) => {
      return argv
        .string('schema')
        .describe('schema', 'The schema to use when building the pilet.')
        .default('schema', 'v2')
        .boolean('source-maps')
        .describe('source-maps', 'Includes the source maps with the pilet.')
        .default('source-maps', true)
        .number('log-level')
        .describe('log-level', 'The log level to use (0-5).')
        .default('log-level', 3);
    },
    (args) => {
      prepare(baseDir);
      return apps
        .buildPilet(baseDir, {
          entry,
          schemaVersion: args.schema,
          sourceMaps: args['source-maps'],
          app,
          target,
          bundlerName,
          logLevel: args['log-level'],
          hooks: {
            afterBuild() {
              copyStatic(outputPath);
            },
          },
        })
        .then(
          () => process.exit(0),
          (err) => {
            console.error(err);
            process.exit(1);
          },
        );
    },
  )
  .help().argv;
