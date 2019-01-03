# cypress-run
Hopefully this module is short-lived. Right now it add retry support for parallel runs. It should work just like `cypress run` by forwarding all arguments, just using the Cypress Module API to support parallelization.

It uses this gist and turns it into a module and adds support for `cypress run` arguments: https://gist.github.com/Bkucera/4ffd05f67034176a00518df251e19f58#file-cypress-retries-js

This modules also adds retries regardless of `--parallel` or `--record` flags and doesn't need the Cypress Dashboard.

It looks like this in the Cypress Dashboard:
![screen shot 2019-01-02 at 6 03 40 pm](https://user-images.githubusercontent.com/338257/50619849-14126800-0eb9-11e9-807f-6ca7fa4a73f3.png)
