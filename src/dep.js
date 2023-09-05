const { ghApi, downlaodTarball } = require('./gh');
const fs = require("fs");

function repoExists(name) {
  const result = ghApi(`repos/${name}`);
  if (result.result.message === "Not Found") {
    return false;
  }
  return true;
}

function versionExists(name, version) {
  const result = ghApi(`repos/${name}/releases/tags/${version}`);
  if (result.result.message === "Not Found") {
    return false;
  }
  return true;
}

/**
 * @param {string} name
 * @returns {string} latest version of the repo
 */
function getLatestVersion(name) {
  const result = ghApi(`repos/${name}/releases/latest`);
  if (result.result.message === "Not Found") {
    return "";
  }
  return result.result.tag_name;
}

function initThisModule() {
  if (fs.existsSync("./dep.json")) {
    console.log("Already initialized");
    process.exit();
  }
  /**
   * @type {ThisModule}
   */
  const newJson = {
    dependency_dir: "./modules",
    dependencies: {},
  }

  updateThisModule(newJson);
}

function updateThisModule(thisModule, cwd = undefined) {
  if (!cwd) {
    cwd = process.cwd();
  }
  const file = `${cwd}/dep.json`;
  const content = JSON.stringify(thisModule, null, 2);
  try {
    fs.writeFileSync(file, content);
  } catch (error) {
    console.error(error);
    console.log("error writing dep.json");
    process.exit(1);
  }
}

/**
 * @param {string} cwd
 * @returns {ThisModule | undefined}
 */
function getThisModule(cwd = undefined, quiet = false) {
  function msg(s) {
    if (!quiet) {
      console.log(s);
    }
  }


  if (!cwd) {
    cwd = process.cwd();
  }
  const file = `${cwd}/dep.json`;

  if (!fs.existsSync(file)) {
    msg("dep.json not found");
    return;
  }
  var file_content;
  try {
    file_content = fs.readFileSync(file, "utf8");
  } catch (error) {
    console.error(error);
    msg("error reading dep.json");
    return;
  }
  var json;
  try {
    json = JSON.parse(file_content);
  } catch (error) {
    console.error(error);
    msg("error parsing dep.json");
    return;
  }
  if (!json.dependency_dir) {
    msg("dependency_dir not found in dep.json");
    return;
  } else if (typeof json.dependency_dir !== "string") {
    msg("dependency_dir is not a string in dep.json");
    return;
  }
  if (json.dependencies) {
    for (const [key, value] of Object.entries(json.dependencies)) {
      if (typeof value === "string") {
        continue;
      } else if (typeof value === "object") {
        if (!value.version) {
          msg(`version not found in dep.json for ${key}`);
          return;
        } else if (typeof value.version !== "string") {
          msg(`version is not a string in dep.json for ${key}`);
          return;
        }
        if (value.dir_name) {
          if (typeof value.dir_name !== "string") {
            msg(`dir_name is not a string in dep.json for ${key}`);
            return;
          }
        }
      }
    }
  }

  preprocessDependencies(json);

  return json;
}

function preprocessDependencies(thisModule) {
  // preprocess dependencies
  for (const [key, value] of Object.entries(thisModule.dependencies)) {
    if (typeof value === "string") {
      thisModule.dependencies[key] = {
        version: value,
        dir_name: key.split("/").join("_")
      }
    } else if (typeof value === "object") {
      if (!value.dir_name) {
        value.dir_name = key.split("/").join("_");
      }
    }
  }
}

function setVersion(thisModule, repo, version, dir_name = undefined) {
  if (!dir_name) {
    dir_name = repo.split("/").join("_");
  }
  if (!thisModule.dependencies[repo]) {
    if (dir_name) {
      thisModule.dependencies[repo] = {
        version: version,
        dir_name: dir_name
      }
    } else {
      thisModule.dependencies[repo] = version;
    }
  } else {
    if (dir_name) {
      if (typeof thisModule.dependencies[repo] === "string") {
        thisModule.dependencies[repo] = {
          version: version,
          dir_name: dir_name
        }
      } else {
        thisModule.dependencies[repo].version = version;
        thisModule.dependencies[repo].dir_name = dir_name;
      }
    } else {
      if (typeof thisModule.dependencies[repo] === "string") {
        thisModule.dependencies[repo] = version;
      } else {
        thisModule.dependencies[repo].version = version;
      }
    }
  }
}



module.exports = { initThisModule, getThisModule, repoExists, versionExists, downlaodTarball, getLatestVersion, setVersion, preprocessDependencies, updateThisModule };
