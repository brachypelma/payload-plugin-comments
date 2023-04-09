# Payload Comments Plugin

[![NPM]()]()

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

## Options

### Default options

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

If you pass in an options object to `comments()`, whatever property/value pairs you include in your options will override the defaults. Any properties overridden will fall back to their default values.

### slug: `string`

Matches the `slug` property of the comments collection created. [More information in Payload's documentation on Collections](https://payloadcms.com/docs/configuration/collections)

Default value: `'comments'`

### singularLabel: `string`

If you configure your collection to send emails when a new comment is received, this is the term that will be used to refer to the submission in the alert email, e.g.: `'Information about this ${singularLabel}'`

Default value: `'comment'`

### admin `{defaultColumns: string[], useAsTitle: string}`

Matches admin property of Payload collection config. [More information in Payload's documentation on Collections](https://payloadcms.com/docs/configuration/collections)

Default value:
`{
  defaultColumns: ['id', 'author', 'email', 'isApproved', 'content'],
  useAsTitle: 'id',
}`

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

### timestamps `boolean`

Determines whether to use Payload's built-in `createdAt` and `updatedAt` timestamps on your comments collection. [More information in Payload's documentation on Collections](https://payloadcms.com/docs/configuration/collections)

Default value: `true`

### path: `string`

The custom API endpoint path for this colllection. **This endpoint should only be used for handling incoming comments,** e.g. as an endpoint for a comment form on your article or post, because it is tethered to the [`processComment` handler](#processcomment-handler-for-new-comments), which handles incoming comments submitted to your Payload instance.

[More information in Payload's documentation on custom API endpoints](https://payloadcms.com/docs/rest-api/overview#custom-endpoints)

Default value: `/add-comment`

### method: `string`

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

### alertRecipients: 

## `processComment` Handler for New Comments


