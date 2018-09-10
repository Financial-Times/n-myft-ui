# n-myft-ui myft

Client-side module to handle display of generic myft ui e.g. add to myft buttons

## Consuming

* Include JS and SCSS
* Templates are provided for the following:

### Following

	{{> n-myft-ui/components/follow-button/follow-button}}

The templates require a _conceptId_ variable. You can also override the button text by providing a _buttonText_ property.

You can require different versions of the button as below:
	{{> n-myft-ui/components/follow version='3'}}

You can require different variants of the button as below:
	{{> n-myft-ui/components/follow-button/follow-button variant='standout'}}
	{{> n-myft-ui/components/follow-button/follow-button variant='inverse'}}

You can require different sizes of the button as below:
	{{> n-myft-ui/components/follow-button/follow-button size="big" variant='standout'}}

### Save for later

	{{>n-ui/myft/templates/save-for-later contentId=id}}
	{{>n-ui/myft/templates/unsave-for-later contentId=id}}

The templates require an _contentId_ variable. You can also override the button text by providing a _buttonText_ property.
There is a different styling available. To apply the styling, provide _saveButtonWithIcon_ property and set it `true`. Check the styling on demos.

## JS API

- `init()` Sets up listeners to update all myft buttons (follow, save, preference) to match the user's preferences
- `updateUi(el)` Update the ui within a given element to match the user's preferences. If `el` is undefined applies to the whole page

## Releasing

This is a bower module, to release update the git tag.

## Testing

Run `make test` to run Karma/Mocha tests.
