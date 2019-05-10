#!/usr/bin/env node

const program = require('commander')
const cypress = require('cypress')
const crypto = require('crypto')

const coerceFalse = arg => {
  return arg !== 'false'
}

const oneLine = strings =>
  strings
    .map(s =>
      s
        .split('\n')
        .map(l => l.trim())
        .filter(l => l)
        .join('\n')
    )
    .join('')

const processEnv = env =>
  env.split(',').reduce((acc, pair) => {
    const [key, value] = pair.split('=')
    acc[key] = value
    return acc
  }, {})

const descriptions = {
  record: 'records the run. sends test results, screenshots and videos to your Cypress Dashboard.',
  key:
    'your secret Record Key. you can omit this if you set a CYPRESS_RECORD_KEY environment variable.',
  spec: 'runs a specific spec file. defaults to "all"',
  reporter:
    'runs a specific mocha reporter. pass a path to use a custom reporter. defaults to "spec"',
  reporterOptions: 'options for the mocha reporter. defaults to "null"',
  port: 'runs Cypress on a specific port. overrides any value in cypress.json.',
  env:
    'sets environment variables. separate multiple values with a comma. overrides any value in cypress.json or cypress.env.json',
  config:
    'sets configuration values. separate multiple values with a comma. overrides any value in cypress.json.',
  browser: oneLine`
    runs Cypress in the browser with the given name.
    note: using an external browser will not record a video.
  `,
  detached: 'runs Cypress application in detached mode',
  project: 'path to the project',
  global: 'force Cypress into global mode as if its globally installed',
  headed: 'displays the Electron browser instead of running headlessly',
  dev: 'runs cypress in development and bypasses binary check',
  forceInstall: 'force install the Cypress binary',
  exit: 'keep the browser open after tests finish',
  cachePath: 'print the cypress binary cache path',
  cacheList: 'list the currently cached versions',
  cacheClear: 'delete the Cypress binary cache',
  group: 'a named group for recorded runs in the Cypress dashboard',
  parallel:
    'enables concurrent runs and automatic load balancing of specs across multiple machines or processes',
  ciBuildId:
    'the unique identifier for a run on your CI provider. typically a "BUILD_ID" env var. this value is automatically detected for most CI providers',
  retries: 'number of times a test will retry before marking as a failure',
}

const filterArgs = config => {
  const inputKeys = Object.keys(descriptions)
  return Object.keys(config).reduce((acc, key) => {
    if (inputKeys.includes(key)) {
      acc[key] = config[key]
    }
    return acc
  }, {})
}

let totalFailuresIncludingRetries = 0

// id unique to the machine
const uniqueId = crypto.randomBytes(3).toString('hex')

const run = (opts, num = 0, retryGroup = undefined, spec = undefined) => {
  num += 1
  const config = Object.assign({}, opts, {
    env: {
      numRuns: num,
      ...(opts.env || {}),
    },
  })

  if (spec) {
    config.spec = spec
  }

  if (retryGroup) {
    config.group = retryGroup
  }

  return cypress.run(config).then(results => {
    if (results.totalFailed) {
      totalFailuresIncludingRetries += results.totalFailed

      // rerun again with only the failed tests
      const specs = results.runs.filter(r => r.stats.failures).map(r => r.spec.relative)

      console.log(`Run #${num} failed.`)

      // if this is the 3rd total run (2nd retry)
      // and we've still got failures then just exit
      if (num >= opts.retries) {
        console.log(`Ran a total of '${opts.retries}' times but still have failures. Exiting...`)
        return process.exit(totalFailuresIncludingRetries)
      }

      console.log(`Retrying '${specs.length}' specs...`)
      console.log(specs)

      // If we're using parallelization, set a new group name
      let retryGroupName
      if (config.group) {
        retryGroupName = `${opts.group}: retry #${num} (${specs.length} spec${
          specs.length === 1 ? '' : 's'
        } on ${uniqueId})`
      }

      // kick off a new suite run
      return run(opts, num, retryGroupName, specs)
    }
    if (results.failures) {
      throw results
    }

    return results
  })
}

program
  .usage('[options]')
  .description('Runs Cypress tests from the CLI without the GUI')
  .option('--record [bool]', descriptions.record, coerceFalse)
  .option('--headed', descriptions.headed)
  .option('-r, --retries <n>', descriptions.retries, parseFloat, 3)
  .option('-k, --key <record-key>', descriptions.key)
  .option('-s, --spec <spec>', descriptions.spec)
  .option('-r, --reporter <reporter>', descriptions.reporter)
  .option('-o, --reporter-options <reporter-options>', descriptions.reporterOptions)
  .option('-p, --port <port>', descriptions.port)
  .option('-e, --env <env>', descriptions.env, processEnv)
  .option('-c, --config <config>', descriptions.config)
  .option('-b, --browser <browser-name>', descriptions.browser)
  .option('-P, --project <project-path>', descriptions.project)
  .option('--parallel', descriptions.parallel)
  .option('--group <name>', descriptions.group)
  .option('--ci-build-id <id>', descriptions.ciBuildId)
  .option('--no-exit', descriptions.exit)
  .option('--dev', descriptions.dev, coerceFalse)
  .parse(process.argv)

run(filterArgs(program)).catch(err => process.exit(1))
