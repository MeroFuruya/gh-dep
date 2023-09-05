const fs = require("fs");
const { initThisModule, getThisModule, repoExists, versionExists, downlaodTarball, getLatestVersion, setVersion, preprocessDependencies, updateThisModule } = require("./dep.js");

/**
 * @summary Show the help message
 * @returns {void}
 */
function help() {
  const help = [
    "Usage: dep <command> [options]",
    "",
    "Commands:",
    "  help      Show this help message",
    "  version   Show the version of this package",
    "",
    "  init      Initialize a dep.json file",
    "  list      List all dependencies",
    "  tree      Show a tree of all dependencies",
    "",
    "  reinstall                    reinstall all dependencies",
    "  install                      Install all (missing) dependencies",
    "  install <repo>[@<version>]   Install a dependency",
    "  uninstall <repo>             Uninstall a dependency",
  ];
  console.log(help.join("\n"));
}

/**
 * @summary Show the version of this package
 * @returns {void}
 */
function version() {
  if (fs.existsSync("./package.json")) {
    const package_json = fs.readFileSync("./package.json", "utf8");
    const package = JSON.parse(package_json);
    if (!package.version) {
      console.log("package.json does not contain a version");
      process.exit(1);
    }
    console.log(package.version);
  } else {
    console.log("package.json not found, version unknown");
  }
}

function init() {
  initThisModule();
}

/**
 * @summary Install a dependency
 * @param {string} repo can be just "repo" or "repo@version"
 * @returns {void}
 */
function install(repo) {
  var version = "latest";
  if (repo.includes("@")) {
    const split = repo.split("@");
    repo = split[0];
    version = split[1];
  }

  if (!repoExists(repo)) {
    console.log(`repo ${repo} does not exist`);
    return;
  }

  if (version === "latest") {
    version = getLatestVersion(repo);
    if (!version) {
      console.log(`repo ${repo} has no versions`);
      return;
    }
  }

  if (!versionExists(repo, version)) {
    console.log(`version ${version} does not exist for ${repo}`);
    return;
  }

  const thisModule = getThisModule();
  if (!thisModule) {
    return;
  }

  if (thisModule.dependencies[repo]) {
    if (thisModule.dependencies[repo].version === version) {
      console.log(`${repo}@${version} already installed`);
      return;
    } else {
      console.log(`${repo} already installed, overriding`);
      fs.rmSync(`${thisModule.dependency_dir}/${thisModule.dependencies[repo].dir_name}`, { recursive: true });
      setVersion(thisModule, repo, version);
    }
  } else {

    setVersion(thisModule, repo, version);
  }
  updateThisModule(thisModule, process.cwd());
  if (installAll(false, process.cwd(), preprocessDependencies(thisModule))) {
    console.log(`installed ${repo}@${version}`);
  }
}

/**
 * @summary List all dependencies
 * @returns {void}
 */
function list() {
  const thisModule = getThisModule();
  if (!thisModule) {
    return;
  }
  for (const [key, value] of Object.entries(thisModule.dependencies)) {
    console.log(`${key}: ${value.version}`);
  }
}

/**
 * @param {boolean} override 
 * @param {string} cwd 
 * @param {ThisModule} thisModule 
 * @returns {void}
 */
function installAll(override = false, cwd = undefined, thisModule = undefined) {
  if (!cwd) {
    cwd = process.cwd();
  }
  var _thisModule;
  if (!thisModule) {
    _thisModule = getThisModule(cwd);
  } else {
    _thisModule = thisModule;
  }

  if (!_thisModule) {
    return;
  }

  _thisModule = preprocessDependencies(_thisModule);

  /**
   * @type {[string, Dep]}
   */
  for (const [key, value] of Object.entries(_thisModule.dependencies)) {
    if (!repoExists(key)) {
      console.log(`repo ${key} does not exist, skipping`);
      continue;
    }
    if (!versionExists(key, value.version)) {
      console.log(`version ${value.version} does not exist for ${key}, skipping`);
      continue;
    }
    if (fs.existsSync(`${_thisModule.dependency_dir}/${value.dir_name}`)) {
      if (override) {
        console.log(`${key} already installed, overriding`);
        fs.rmSync(`${_thisModule.dependency_dir}/${value.dir_name}`, { recursive: true });
      } else {
        continue;
      }
    }
    downlaodTarball(key, value.version, _thisModule.dependency_dir, value.dir_name, cwd)
    installAll(override, `${cwd}/${_thisModule.dependency_dir}/${value.dir_name}`);
  }
}

/**
 * @summary Show a tree of all dependencies
 * @returns {void}
 */
function tree(max_depth = Infinity) {
  function fetchModule(cwd, depth = 0) {
    if (depth > max_depth) {
      return {};
    }
    const thisModule = getThisModule(cwd, true);
    if (!thisModule) {
      return;
    }
    const res = {};
    for (const [key, value] of Object.entries(thisModule.dependencies)) {
      res[key] = fetchModule(`${cwd}/${thisModule.dependency_dir}/${value.dir_name}`, depth + 1) || {};
    }
    return res;
  }

  function printModule(module, depth = 0) {
    for (const [key, value] of Object.entries(module)) {
      console.log(`${" \\".repeat(depth)}${key}`);
      printModule(value, depth + 1);
    }
  }
  printModule(fetchModule(process.cwd()));
}

function uninstall(repo) {
  const thisModule = getThisModule();
  if (!thisModule) {
    return;
  }
  if (!thisModule.dependencies[repo]) {
    console.log(`${repo} is not installed`);
    return;
  }
  fs.rmSync(`${thisModule.dependency_dir}/${thisModule.dependencies[repo].dir_name}`, { recursive: true });
  delete thisModule.dependencies[repo];
  updateThisModule(thisModule, process.cwd());
}

module.exports = { help, version, init, install, list, installAll, tree, uninstall };
