# Payload Comments Plugin

# STILL IN DEVELOPMENT -- DO NOT USE UNTIL RELEASED

A fully-customizable plugin for [Payload CMS](https://github.com/payloadcms/payload) to create a collection for comments, reviews, or other user-submitted feedback on your website or web application.

## Core features:

- Adds a collection to your Payload CMS instance for comments with the following features out of the box:
  - Standard fields configured by default
  - Payload API endpoint to which you can POST comment data
  - Comment processing/validation callback
  - Option to receive email whenever a new comment is received.
- Fully customizable
  - Add, edit, remove collection fields
  - Add comment approval logic, including the ability to set parameters to approve when a new comment is received.
  - Customize email sent when a new comment is received.

## Use cases:

- Blog/article comments
- Product reviews
- Discussion forums
- Any other user-authored content for your website or Payload application

## Installation

## Basic Usage

In the `plugins` array of your [Payload config](https://payloadcms.com/docs/configuration/overview), call the plugin with [options](#options):

```js
import { buildConfig } from "payload/config";
import search from "@payloadcms/plugin-search";

export default buildConfig({
  collections: [
    {
      slug: "pages",
      fields: [],
    },
    {
      slug: "posts",
      fields: [],
    },
  ],
  plugins: [
    comments(),
  ],
});
```

## Default options

If you call `comments()` without an options object, the plugin will add a Comments collection to your Payload instance with the following default options:

```js
const defaultOptions = {
  slug: 'comments',
  singularLabel: 'comment',
  admin: {
    defaultColumns: ['id', 'author', 'email', 'isApproved', 'content'],
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'content',
      type: 'textarea'
    },
    {
      name: 'replyPost',
      type: 'relationship',
      relationTo: 'posts',
    },
    {
      name: 'replyComment',
      type: 'relationship',
      relationTo: 'comments',
    },
    {
      name: 'isApproved',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
  path: '/add-comment',
  method: 'post',
  collectionsAllowingComments: ['posts'],
  sendAlert: false,
  alertRecipients: [],
  alertFrom: '',
  alertSubject: 'Your site received a new comment',
  alertIntro: '<p>Your site received the following comment.</p>',
  alertClosing: '<p>Please log in to review, approve, or delete this comment.</p>',
  alertEditUrlBase: '',
  autoPublish: false,
  autoPublishConditions: [],
}
```

## Options

If you pass in an options object to `comments()`, whatever property/value pairs you include in your options will override the defaults. Any properties not overridden by the options object you pass will fall back to their default values.

### slug: `string`

Matches the `slug` property of the comments collection created. [More information in Payload's documentation on Collections](https://payloadcms.com/docs/configuration/collections)

Default value: `'comments'`

### singularLabel: `string`

If you configure your collection to send emails when a new comment is received, this is the term that will be used to refer to the submission in the alert email, e.g.: `'Information about this ${singularLabel}'`

Default value: `'comment'`

### admin `{defaultColumns: string[], useAsTitle: string}`

Matches admin property of Payload collection config. [More information in Payload's documentation on Collections](https://payloadcms.com/docs/configuration/collections)

Default value:
```js
{
  defaultColumns: ['id', 'author', 'email', 'isApproved', 'content'],
  useAsTitle: 'id',
}
```

### fields `Field[]`

An array of [Payload Collection Fields](https://payloadcms.com/docs/fields/overview) that will appear on the Payload admin screen. This will generally contain the content of the comment, the author, whether the comment is approved for display, and any other data you wish to store regarding the comment, whether it is authored by person submitting the comment or by the Payload admin.

Default value:

```js
{
  name: 'author',
  type: 'text',
},
{
  name: 'email',
  type: 'email',
},
{
  name: 'content',
  type: 'textarea'
},
{
  name: 'replyPost',
  type: 'relationship',
  relationTo: 'posts',
},
{
  name: 'replyComment',
  type: 'relationship',
  relationTo: 'comments',
},
{
  name: 'isApproved',
  type: 'checkbox',
  defaultValue: false,
},
```

#### Required fields

**Although plugin users can define their own fields, two fields, `isApproved` and `replyPost`, are required and will always be added to the collection with the properties specified below, since they are vital to the functionality of the plugin**

##### `isApproved`: `Field`

The plugin will ensure that your collection always has a field with the name `isApproved` with a type of `checkbox`. If you want to se the `defaultValue` to `true`, you can include the following in your `fields` array when passing in options to the `comment` function:

```js
{
  name: 'isApproved',
  type: 'checkbox',
  defaultValue: true,
}
```

[Read the Payload documentation on Collection Fields for more information.](https://payloadcms.com/docs/fields/relationship)

##### `replyPost`: `Field`

The plugin will ensure that your collection always has a field with the name `replyComment` with a type of `checkbox`. You can override the `relationTo` value by passing a comments object to the `comment` function with the following in your option object's `fields` array, replacing `'my-collection-slug'` with the `slug` of the collection you would like to associate with comments, or an array of `slug`s if you would like to allow users to comment on items in multiple collections:

```js
{
  name: 'replyPost',
  type: 'relationship',
  relationTo: 'my-collection-slug',
}
```

[Read the Payload documentation on Collection Fields for more information.](https://payloadcms.com/docs/fields/relationship)

### timestamps `boolean`

Determines whether to use Payload's built-in `createdAt` and `updatedAt` timestamps on your comments collection. [More information in Payload's documentation on Collections](https://payloadcms.com/docs/configuration/collections)

Default value: `true`

### path: `string`

The custom API endpoint path for this colllection. **This endpoint should only be used for handling incoming comments,** e.g. as an endpoint for a comment form on your article or post, because it is tethered to the [`processComment` handler](#processcomment-handler-for-new-comments), which handles incoming comments submitted to your Payload instance.

[More information in Payload's documentation on custom API endpoints](https://payloadcms.com/docs/rest-api/overview#custom-endpoints)

Default value: `/add-comment`

### method: `'get'|'post''`

HTTP verb used to access the custom endpoint for handling incoming comments. [More information in Payload's documentation on custom API endpoints](https://payloadcms.com/docs/rest-api/overview#custom-endpoints)

Default value: `post`

### additionalEndpoints: `Omit<Endpoint, "root">[]`

And array of [Payload Custom Endpoints](https://payloadcms.com/docs/rest-api/overview#custom-endpoints) to add to your comments collection beyond the default endpoint added to handling incoming comments.

Default value: `[]`

### collectionsAllowingComments `string[]`

An array of strings, each string being a slug for a collection in your Payload instance that can have comments. Comments are linked to other collection items via a relationship field, so it is necessary to know which collections comments can be attached to.

**NB, for this plugin to work, it is necessary to override the default value for this, since this value is set to an empty array be default.**

Default value: `[]`

### sendAlert: `boolean`

Determines whether to send email alerts to specified email addresses when your Payload instance receives a new comment submission.

Default value: `false`

### alertRecipients: `string[]`

Array of email addresses that should receive email alerts when a new comment is sucessfully processed by the [`processComment` handler](#processcomment-handler-for-new-comments) if [`sendAlert`](#sendalert-boolean) is set to `true`.

Default value: `[]`

### alertFrom: `string`

The value that your Payload instance's Nodemailer instance will use as the "From" address when a new comment is sucessfully processed by the [`processComment` handler](#processcomment-handler-for-new-comments) if [`sendAlert`](#sendalert-boolean) is set to `true`.

[See the Nodemailer documentation for formatting options.](https://nodemailer.com/message/)

Default value: `''`

### alertSubject: `string`

The subject line your Payload instance's Nodemailer instance will use for email alerts when a new comment is sucessfully processed by the [`processComment` handler](#processcomment-handler-for-new-comments) if [`sendAlert`](#sendalert-boolean) is set to `true`.

Default value: `'Your site received a new comment'`

### alertIntro: `string`

The opening line of the email alert to be sent  when a new comment is sucessfully processed by the [`processComment` handler](#processcomment-handler-for-new-comments) if [`sendAlert`](#sendalert-boolean) is set to `true`.

**NB, the content of this should be in HTML, not plain text.**

This line will display above a table listing the field values for the incoming process you are being alerted about.

Default value: `'<p>Your site received the following comment.</p>'`

### alertClosing: `string`

The closing line of the email alert to be sent  when a new comment is sucessfully processed by the [`processComment` handler](#processcomment-handler-for-new-comments) if [`sendAlert`](#sendalert-boolean) is set to `true`.

**NB, the content of this should be in HTML, not plain text.**

This line will display below a table listing the field values for the incoming process you are being alerted about and a link to the Payload admin page where admins can review, approve, edit, or delete the incoming comment.

Default value: `'<p>Please log in to review, approve, or delete this comment.</p>'`

### alertEditUrlBase: `string`

If you are sending email alerts when new comments are received, the email you receive will contain a direct link to the Payload admin page for that new comment, making it easier for you to approve, edit, or delete the incoming comment. To construct this URL, the plugin takes the root URL to which your Payload instance is deployed and adds a URL path to the comment. The `alertEditUrlBase` property provides the base of the URL used in the email, consisting of the protocol, the subdomain, the domain name, the domain extension, and the admin directory for the site, e.g. `https://www.example-payload-deployment.com/admin`.

By default, the plugin will try to constuct this from the `serverURL` and `routes.admin` properties in your [Payload configuration](https://payloadcms.com/docs/configuration/overview), if provided. If `routes.admin` is not set, the plugin will fall back to the default `admin` path.

Default value: `serverURL + routes.admin` from your Payload config.

### autoPublish: `boolean`

Determines whether to allow automatic approval of incoming comments when they are received by the [`processComment` handler](#processcomment-handler-for-new-comments).

If `autoPublish` is set to `true` and [`autoPublishConditions`](#autopublishconditions-string) is set to an empty array, all incoming comments will be saved to your Payload instance with an the `isApproved` field value set to `true`.

If `autoPublish` is set to `true` and [`autoPublishConditions`](#autopublishconditions-string) contains one or more item, then when the [`processComment` handler](#processcomment-handler-for-new-comments) processes an incoming comment, the handler will search the `body` of the API `Request` for properties matching the value of each string in the `autoPubishConditions` array and set the `isApproved` value of the incoming comment based on its evaluation of the truthiness of eahc condition. (See `[autoPublishConditions](#autopublishconditions-string)`) for more information.

If `autoPublish` is set to `false`, every comment that `processComment` can properly handle will be saved to your Payload instance with an `isApproved` value of `false`.

Default value: `false`

### autoPublishConditions `string[]`

If `[autoPublish](#autopublish-boolean)` is set to `true`, then this array contains a list of strings that should match values on the `body` of the `Requset` dispatched to the custom API endpoint for comments used to handle incoming comments (See [`path`](#path-string)).

When processing incoming comments, if `autoPublish` is `true` and `autoPublishConditions` contains one or more `string` values, the [`processComment` handler](#processcomment-handler-for-new-comments) will evaluate the `body` of the API `Request` received for the truthiness of all the conditions on the `body` as follows:

```ts
function getIsApproved(body: any, options: CommentOptions) {
  const { autoPublish, autoPublishConditions } = options
  
  if (!autoPublish || !body) return false
  if (!autoPublishConditions?.length) return true

  return autoPublishConditions.filter(cond => !body[cond]).length === 0
}
```

If `getIsApproved` returns `true`, then the incoming comment will be saved to your Payload instance with an `isApproved` value of `true`. Otherwise, it will be saved with an `isApproved` value of `false`.

Default value: `[]`

## `processComment` Handler for New Comments

This is the handler function for the default `/add-comment` endpoint for the comments collection created by this plugin. Understanding how this function handles incoming comments is necessary to allow you to configure forms or other tools to allow people to submit comments to your Payload instance.

### Arguments

The handler receives three arguments:

* `{ body }`: The `body` of an incoming Express [`Request`](https://expressjs.com/en/api.html#req) object
* `res`: An Express [`Response`](https://expressjs.com/en/api.html#res) object to be returned by the default `/add-comment` endpoint after handling the incoming `Request`.
* `options`: The `CommentOptions` object for your comments collection [see `options` documentation](#options)

### Execution steps

The handler examines the incoming `Request` to determine whether it can successfully create a new comment in several ways outlined below.

#### Check `collectionsAllowingComments`

Determine whether there are any collection `slug`s listed in.

If not, no collections accept comments, so there is nothing for users to comment on (function will return a `Response` with code `400` and the message `''Your site is not configured to accept your submission.''`).

If there are `slug`s listed in the array, proceed to the next step of function execution.

#### Look up the matching `replyPost`

Call the `getReplyPost` function to search all collections receiving comments for an item whose `id` matches the value of the incoming `Request` `body`'s `replyPost` property value.

**NB, your `Request` body MUST have a `replyPost` property whose value is set to the ID of the item in the Payload instance being commented on**

If no matching item is found in the Payload instance, the function will return a `Response` with code `400` and the message `''We were unable to find a target for your submission.''`

## Submitting a `Request` to the `/add-comment` API Endpoint

Given the execution steps of the [`processComment` handler function for the default `/add-comment` endpoint outlined above](#processcomment-handler-for-new-comments), you will need to make that that when you configure a website `form`, application, or other tool for submitting comments to your Payload instance, the `body` of the `Request` you submit to the Payload API has the following to ensure users are able to successfully use your form/etc. to submit comments.

### `Request` object `body`

* The `body` of your `Request` must have a `replyPost` property whose value matches the ID of the post, product, or other Payload database item that will receive the comment being submitted.

* All other `body` properties that you want to have recorded in a Collection `Field` must have a property name matching the `Field` name and a value matching the intended value of the `Field` for the comment being processed. For instance, if you are using the default `fields` option, then the `body` of your `Request` to the `/add-post` API endpoint should include properties named `author`, `email`, etc.

* If you are using `autoPublishConditions`, any conditions you want to use to evaluate whether to automatically publish a commpent passed to the `/add-comment` API endpoint must be included as properties of the `body` of the `Request` to the API endpoint. The `isApproved` field wiill be set to `true` if and only if every string in the `autoPublishConditions` array matches a property on `body` of the incoming `Request` and the value of every matching property of the `body` is truthy:

```ts
function getIsApproved(body: any, options: CommentOptions) {
  const { autoPublish, autoPublishConditions } = options
  
  if (!autoPublish || !body || typeof body !== 'object') return false
  if (!autoPublishConditions?.length) return true

  return autoPublishConditions.filter(cond => !body[cond]).length === 0
}
```
