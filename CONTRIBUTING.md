# Contribution guide

## Developing LOAST

Please consider these guidelines when filing a pull request:

*  Commits follow the [Angular commit convention](https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines)
    *  Commits messages are enforced using husky hooks and [commitlint](https://github.com/conventional-changelog/commitlint)
    *  [Commitizen](https://github.com/commitizen/cz-cli) can be used to create commits following the correct format. This is integrated in a commit message hook, so can be accessed by simply typing `git commit`
*  Prettier is used to enforce code style
*  eslint is used to enforce code quality
*  Features and bug fixes should be covered by test cases

## Creating releases

LOAST uses [semantic-release](https://github.com/semantic-release/semantic-release)
to release new versions automatically.

*  Commits of type `fix` will trigger bugfix releases, think `0.0.1`
*  Commits of type `feat` will trigger feature releases, think `0.1.0`
*  Commits with `BREAKING CHANGE` in body or footer will trigger breaking releases, think `1.0.0`

All other commit types will trigger no new release.
