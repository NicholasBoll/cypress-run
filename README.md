# cypress-run
Hopefully this module is short-lived. Right now it add retry support for parallel runs. It should work just like `cypress run` by forwarding all arguments, just using the Cypress Module API to support parallelization.

It uses this gist and turns it into a module and adds support for `cypress run` arguments: https://gist.github.com/Bkucera/4ffd05f67034176a00518df251e19f58#file-cypress-retries-js
