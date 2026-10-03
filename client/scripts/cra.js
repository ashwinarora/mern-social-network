// Runs a react-scripts command (`node scripts/cra.js build`) with the no-contact flag
// mapped for Create React App. See README "No-contact mode".
//
// CRA only exposes REACT_APP_* variables to client code, so REACT_APP_NO_CONTACT is
// derived here from NO_CONTACT, which is the only variable anyone sets. It is always
// defined ("true" or "false") so that webpack can replace it with a literal either way.
const { spawnSync } = require('child_process')

const noContact = process.env.NO_CONTACT === 'true'
const [command, ...rest] = process.argv.slice(2)

const env = { ...process.env, REACT_APP_NO_CONTACT: noContact ? 'true' : 'false' }
// Source maps contain the original source, including the branches a no-contact build removes.
if (noContact) env.GENERATE_SOURCEMAP = 'false'

const result = spawnSync(
    process.execPath,
    [require.resolve('react-scripts/bin/react-scripts.js'), command, ...rest],
    { stdio: 'inherit', env }
)
if (result.error) throw result.error
if (result.status !== 0) process.exit(result.status === null ? 1 : result.status)

if (command === 'build' && noContact) require('./no-contact-postbuild')
