# n-myft-ui
Client side component for interaction with myFT.

4 entry points (both for js and scss)

- myft
- myft-common
- myft-digest-promo
- myft-hint

These subdirectories may contain a README. If not, please speak to the myft team about how to use them.

## Making changes

n-myft-ui provides the CSS, JS and most templates for the myFT components on FT.com. We use semver to control rollout of the code.

As of August 2017, The following apps use n-myft-ui:
* next-front-page
* next-stream-page
* next-article
* next-myft-page
* next-tour-page
* next-video-page
* next-search-page

When you merge to master, you should make a new release and then roll it out to the apps, plus n-concept which contains a reference to this so that there aren't missing dependencies.

If you are making a major change, you will need to update the bower.json and package.json files for the above apps. For minor and patch updates, you can rebuild without cache from CircleCI.
