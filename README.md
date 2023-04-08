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

### Options
