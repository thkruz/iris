![GitHub commit activity](https://img.shields.io/github/commit-activity/m/thkruz/iris?style=flat-square) ![language](https://img.shields.io/github/languages/top/thkruz/iris?style=flat-square) ![Languages](https://img.shields.io/github/languages/count/thkruz/iris?style=flat-square) ![GitHub issues](https://img.shields.io/github/issues/thkruz/iris?style=flat-square) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) ![License](https://img.shields.io/github/license/thkruz/iris?style=flat-square)

# IRIS - Space Electronic Warfare Sandbox

A stand-alone training platform for Space Electronic Warfare. The application has a "Student front-end" as well as an "instructor front-end." Users have their own "session/game" that the instructor creates and students join. Each "game" has its own unique id. Games exist as standalone objects that can be "spun up" from the database.

The student makes choices given the unique problem set presented and can take action to "jam" electronic signals.

The interface responds if the student chooses the correct setting to jam the signal.

The problem set is presented as a visual representation of electronic signals that force the student to perform the analysis they are trained for.

## Table of Contents

- [Setting up a Local Copy](#Setting-up-a-Local-Copy)
- [Versioning](#Versioning)
- [Tests](#Tests)
- [Contributors](#Contributors)
- [License](#License)

### Setting up a Local Copy

```bash
git clone https://github.com/thkruz/iris        #Clone the github files.
cd ./iris/                                      #Switch into the directory.
docker compose up -d                            #Start the docker containers.
```

## Versioning

We use [SemVer](http://semver.org/) for versioning.

## Tests

### Unit/Functional

Currently we are using Jest for unit and functional tests that should cover at least 80% of the functions. All of these tests can be run using:

```bash
npm run test
```

### End-To-End

For end-to-end (E2E) testing we will be using the cypress framework. This is on the to-do list.

### Security

For security testing we are using SonarCloud automatically in the CI/CD pipeline.

## Contributors

- [@bjhufstetler](https://github.com/bjhufstetler)
- [@thkruz](https://github.com/thkruz/)
- [@filmo003](https://github.com/filmo003/)
- [@bigbpete](https://github.com/bigbpete)

## License

Copyright (C) 2022 Theodore Kruczek

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

[Full License](https://github.com/thkruz/iris/blob/master/LICENSE.md)
