const { spawnSync, spawn } = require('child_process');
const fs = require('fs');

/**
 * Calls the GitHub CLI with the given arguments.
 * @param {readonly string[]} args
 * @returns {{ result: string, error?: Error }}
 */
function gh(args) {
  const gh = spawnSync("gh", args);
  if (gh.error) {
    return { error: gh.error, result: gh.stdout.toString() };
  }
  return { result: gh.stdout.toString() };
}

/**
 * 
 * @param {string} endpoint 
 * @returns {{ result: object, error?: Error }}
 */
function ghApi(endpoint) {
  if (!endpoint) {
    throw new Error("Endpoint is required");
  }
  if (endpoint.startsWith("/")) {
    endpoint = endpoint.substring(1);
  }
  result = gh(["api", endpoint]);
  if (typeof result === "string") {
    try {
      return { result: JSON.parse(result) };
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  } else {
    try {
      result.result = JSON.parse(result.result);
    } catch (error) {
      console.error(error);
    }
  }
  return result;
}

/**
 * downloads a tarball from github and extracts it to the given directory
 * @param {string} repo
 * @param {string} release_name
 * @param {string} out_dir
 * @param {string} out_name
 * @returns {string} directory of the downloaded tarball
 */
function downlaodTarball(repo, release_name, out_dir, out_name, cwd = process.cwd()) {
  // replace \ in out dir with /
  const dir = `${out_dir.replace(/\\/g, "/")}/${out_name}`;
  // create the directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  // download and unpack the tarball
  const result = spawnSync("bash", ["-c", `gh api repos/${repo}/tarball/${release_name} | tar -C ${dir} -xzv --strip-components=1`], { stdio: ["ignore", "inherit", "pipe"] })
  // const result = spawnSync("bash", ["-c", `mkdir -p ${out_dir}/${out_name} && gh api repo/${repo}/tarball/${release_name} | tar -C ${out_dir}/${out_name} -xzv --strip-components=1`], { stdio: "inherit", cwd });
  if (result.stderr.byteLength > 0) {
    console.error(result.stderr.toString());
    return "";
  }

  return `${out_dir}/${out_name}`;
}

module.exports = { ghApi, downlaodTarball };