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
    install(args[1]);
    break;
  case "tree":
    tree();
    break;
  case "list":
    list();
    break;
  case "uninstall":
    if (args.length === 1) {
      console.log("Please specify a repo");
      process.exit(1);
    }
    uninstall(args[1]);
    break;
  case "reinstall":
    installAll(true);
    break;
  default:
    console.log(`Unknown command ${command}`);
    process.exit(1);
}
