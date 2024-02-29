# n-myft-ui [![CircleCI](https://circleci.com/gh/Financial-Times/n-myft-ui.svg?style=svg)](https://circleci.com/gh/Financial-Times/workflows/n-myft-ui)

Client side component for interaction with myFT.

There are two entry points (both for js and scss):

- myft
- myft-common

However, we are trying to transition to an approach where apps explicitly import just the individual components (from the `components/` directory) themselves.

These subdirectories may contain a README. If not, please speak to the myft team about how to use them.

## Making changes

n-myft-ui provides the CSS, JS and most templates for the myFT components on FT.com. We use semver to control rollout of the code.

As of August 2017, The following apps use n-myft-ui:

- next-front-page
- next-stream-page
- next-article
- next-myft-page
- next-tour-page
- next-video-page
- next-search-page

When you merge to main, you should make a new release and then roll it out to the apps so that there aren't missing dependencies.

If you are making a major change, you will need to update the package.json files for the above apps. For minor and patch updates, you can rebuild without cache from CircleCI.

## Running locally

```
npm install
npm run build
npm run demo
```

View the demo on `localhost:5005`


## Demo tasks
```
npm run demo-build
```
This task will build the demo and place it in the `demo/dist` folder.
```
npm run demo
```
This task will run a express server on localhost:5005 serving the builded demo.(it calls demo-build internally).
```
npm run static-demo
```
This tasks will start a Node.js application located in the "demos/app" directory as a background process, 
waits for 10 seconds, fetches content from "http://localhost:5005", adjusts the links in the retrieved content, 
saves it as "index.html" in the "public" directory, moves all files from the "public" directory to the current directory, 
and finally terminates the Node.js process.
This is to prepare it to be uploaded to gh static page.

## Unstable versions

v24, v25, v26 has JSX migration code. They are not stable therefore v27 is released. It is to remove JSX and rollback to handlebars. Please use ^v27.

# RunPa11yCi task
The default Pa11y plugin is configured to run against a deployed review app on heroku.
In cases where the project is an npm component without a deployed environment like this project, this task allows for local server setup prior to running Pa11y tests.
The RunPa11yCi task is a custom task class designed to automate the process of running Pa11y accessibility tests against a local server instance that runs the demo. It utilizes Node.js child processes to manage both the server and Pa11y processes, 
ensuring proper execution and cleanup.

