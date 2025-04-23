module.exports = {
    onPreBuild: async ({ utils }) => {
      try {
        await utils.run.command('npm install -g pnpm')
        await utils.run.command('pnpm install')
        console.log('Installed dependencies with pnpm')
      } catch (error) {
        utils.build.failBuild('Failed to install dependencies with pnpm', { error })
      }
    },
  }