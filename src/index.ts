import { Config } from 'payload/config'
import { CollectionConfig } from 'payload/types'
import { CommentOptions, IncomingOptions } from './types'
import processComment from './process-comment'
import { Request, Response } from "express"

export const defaultOptions: CommentOptions = {
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

function getProcessedOptions(
  incomingOptions: IncomingOptions,
  incomingConfig: Config,
): CommentOptions {
  const options = Object.assign({ ...defaultOptions }, incomingOptions)
  const { serverURL, routes } = incomingConfig

  if (options.sendAlert && !options.alertEditUrlBase && serverURL) {
    const adminDir = routes?.admin ?? 'admin'
    options.alertEditUrlBase = serverURL + adminDir
  }

  return options
}

const comments = (incomingOptions: IncomingOptions = {}) => (incomingConfig: Config): Config => {
  const processedOptions = getProcessedOptions(incomingOptions, incomingConfig)
  const { slug, fields, admin, timestamps, path, method } = processedOptions
  const commentCollection = {
    slug,
    fields,
    admin,
    access: {
      read: () => true,
    },
    timestamps,
    endpoints: [{
      path,
      method,
      handler: async (req: Request, res: Response) => {
        return await processComment(req, res, processedOptions)
      },
    }],
  }
  const collections: CollectionConfig[] = incomingConfig.collections ?? []

  return {
    ...incomingConfig,
    collections: [...collections, commentCollection]
  }
}

export default comments