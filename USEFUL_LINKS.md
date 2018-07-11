# Documentation

### Table of Contents
1. [Git commands](#Git commands)
2. [Markdown](#Markdown)
3. [Git-flow](#git-flow)
4. [Prettier](#https://prettier.io/)

## Git commands

Documentation:
[git-commands](https://confluence.atlassian.com/bitbucketserver/basic-git-commands-776639767.html)

_git status_
List the files you've changed and those you still need to add or commit

_git add *_
Add one or more files to staging (index)

_git commit -m "Commit message"_
Commit changes to head (but not yet to the remote repository)

_git push origin master_
Send changes to the master branch of your remote repository

_git checkout <branchname>_
Switch from one branch to another

_git checkout -b <branchname>_
Create a new branch and switch to it:

_git pull_
Fetch and merge changes on the remote server to your working directory:


## Markdown

Cheatsheet:
[Markdown-Cheatsheet](https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet)

## git-flow 

Documentation:
[git-flow-cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)

To start:
git flow feature start MYFEATURE

To finish:
git flow feature finish MYFEATURE


## https://prettier.io/

In webstorm set up as File Watcher.

[Instructions](https://github.com/prettier/prettier/blob/master/docs/webstorm.md)


## rxjs - Observables

[Nice introduction](https://x-team.com/blog/rxjs-observables/)
[Ngrx effects](https://medium.com/front-end-hacking/managing-state-in-angular-apps-with-ngrx-store-and-ngrx-effects-part-1-a878addba622)

## nvm

**To install:**

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

**To install version 8.10.0:**

nvm install 8.10.0
nvm use 8.10.0

**Sets the default to 8.10.0 when opening a terminal:** 

nvm alias default 8.10.0

**Get the latest npm**

nvm install-latest-npm

**To review verions:**

ng -v


**To clean the node modules:**
rm -rf node_modules
npm cache clean
npm cache clean --force
npm cache verify
npm install // npm i

**Node sass problem:**
sudo npm rebuild node-sass


## nvm

Detect duplicated code:

Install the program:

`npm install jscpd -g`

Doc:
https://github.com/kucherenko/jscpd

Run the commands:
- Css:

`jscpd -f "**/*.scss" -e "**/node_modules/**"`

- Typescript:

`jscpd -f "**/*.ts" -e "**/node_modules/**"`
 


All the list of tags:
git tag -l

Tag a version:
git tag -a X.X.X -m "New tag message"

git push origin X.X.X 

