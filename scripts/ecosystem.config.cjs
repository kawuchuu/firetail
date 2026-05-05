module.exports = {
  apps: [
    {
      name: 'last.fm proxy',
      port: '44285',
      exec_mode: 'cluster',
      instances: 'max',
      script: 'npm',
      args: 'run start_lfm',
      interpeter: 'none'
    }
  ]
}
