const process = require('process');

const { help, version, init, install, list, installAll, tree } = require('./commands.js');

const args = process.argv.slice(2);

if (args.length === 0) {
  help();
  process.exit();
}

const command = args[0];

switch (command) {
  case "help":
    help();
    break;
  case "version":
    version();
    break;
  case "init":
    init();
    break;
  case "i":
  case "install":
    if (args.length === 1) {
      installAll();
      break;
    }
    if (args[1] === "--override") {
      installAll(true);
      break;
    }
    install(args[1]);
    break;
  case "tree":
    tree();
    break;
  case "list":
    list();
    break;
  default:
    console.log(`Unknown command ${command}`);
    process.exit(1);
}
