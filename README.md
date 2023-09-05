# gh-dep
Dependency manager for gh

## Installation

- node >= 8.0.0 installed
- git (dependent on git bash)

```bash
gh extension install merofuruya/gh-dep
```

## Usage

```bash
gh dep help
```

## dep.json

```json
{
  "dependency_dir": "modules",
  "dependencies": {
    "MeroFuruya/environmentality": "v2.1.1",
    "MeroFuruya/gh-dep": {
      "version": "v1.0.0",
      "dir_name": "thisIsAnotherName"
    }
  }
}
```

### `dependency_dir`

- default: `modules`
- type: `string`
- description: directory name where dependencies are installed

### `dependencies`

- type: `object`
- description: dependencies to install
- key: `string` (github repository name)

As you see with `MeroFuruya/environmentality`, the version is directly specified as the value.
Now gh-dep installs the dependency under `modules/MeroFuruya_environmentality`.

If you want to change the directory name, you can specify `dir_name` as the value.
You can see this with `MeroFuruya/gh-dep`, which is installed under `modules/thisIsAnotherName`.

### `version`

- type: `string`
- description: version to install, that is the tag name of the release, not the release name!
