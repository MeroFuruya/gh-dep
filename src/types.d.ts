interface Repo {
  name: string;
  releases: Release[];
}

interface ThisModule {
  dependency_dir: string = "modules";
  dependencies?: { [repo: string]: Dep };
}

interface Dep {
  version: string;
  dir_name?: string;
}
