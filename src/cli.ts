import { Command } from 'commander';

const program = new Command();

program
  .name('my-command')
  .option('-d, --debug', 'enables verbose logging', false)
  .parse(process.argv);
