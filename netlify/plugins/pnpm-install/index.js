const { execSync } = require('child_process')

module.exports = {
  onPreBuild: async ({ utils }) => {
    try {
      execSync('pnpm --version', { stdio: 'ignore' })
      console.log('pnpm is already installed')
    } catch {
      try {
        await utils.run.command('npm install -g pnpm')
        console.log('Installed pnpm globally')
      } catch (installError) {
        utils.build.failBuild('Failed to install pnpm globally', { error: installError })
        return
      }
    }

    try {
      await utils.run.command('pnpm install')
      console.log('Installed dependencies with pnpm')
    } catch (installError) {
      utils.build.failBuild('Failed to install dependencies with pnpm', { error: installError })
    }
  },
}
