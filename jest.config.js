module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  verbose: true
}

// load env var to jest test
require('dotenv').config({ path: '.env.local' });
