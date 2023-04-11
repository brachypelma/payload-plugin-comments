import { Config } from 'payload/config'
import { CollectionConfig } from 'payload/types'
import { CommentOptions, IncomingOptions } from './types'
import processComment from './process-comment'
import { Request, Response } from "express"
import getProcessedOptions from './process-options'
import hasPublishedComment from './has-published-comment'

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
  addCommentPath: '/add-comment',
  addCommentMethod: 'post',
  hasPublishedCommentPath: '/has-published-comment',
  hasPublishedCommentMethod: 'post',
  hasPublishedCommentFields: ['email'],
  collectionsAllowingComments: [],
  sendAlert: false,
  alertRecipients: [],
  alertFrom: '',
  alertSubject: 'Your site received a new comment',
  alertIntro: '<p>Your site received the following comment.</p>',
  alertClosing: '<p>Please log in to review, approve, or delete this comment.</p>',
  alertEditUrlBase: '',
  autoPublish: false,
  autoPublishConditions: [],
  additionalEndpoints: [],
}

const comments = (incomingOptions: IncomingOptions = {}) => (incomingConfig: Config): Config => {
  const processedOptions = getProcessedOptions(incomingOptions, incomingConfig)
  const {
    slug,
    fields,
    admin,
    timestamps,
    addCommentPath,
    addCommentMethod,
    hasPublishedCommentPath,
    hasPublishedCommentMethod,
    additionalEndpoints,
  } = processedOptions
  const commentCollection: CollectionConfig = {
    slug,
    fields,
    admin,
    access: {
      read: () => true,
    },
    timestamps,
    endpoints: [
      {
        path: addCommentPath,
        method: addCommentMethod,
        handler: async (req: Request, res: Response) => {
          return await processComment(req, res, processedOptions)
        },
      },
      {
        path: hasPublishedCommentPath,
        method: hasPublishedCommentMethod,
        handler: async (req: Request, res: Response) => {
          return await hasPublishedComment(req, res, processedOptions)
        }
      },
      ...additionalEndpoints,
    ],
  }
  const collections: CollectionConfig[] = incomingConfig.collections ?? []

  return {
    ...incomingConfig,
    collections: [...collections, commentCollection]
  }
}

export default comments
