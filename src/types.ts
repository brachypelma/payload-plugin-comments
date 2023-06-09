import { CollectionAdminOptions } from 'payload/dist/collections/config/types'
import { Field } from 'payload/types'
import { Endpoint } from 'payload/config'

export type CommentOptions = { // All properties required
  slug: string,
  singularLabel: string,
  admin: CollectionAdminOptions,
  fields: Field[],
  timestamps: boolean,
  addCommentPath: string,
  addCommentMethod: 'get'|'post',
  hasPublishedCommentPath: string,
  hasPublishedCommentMethod: 'get'|'post',
  hasPublishedCommentFields: string[],
  additionalEndpoints: Omit<Endpoint, "root">[],
  collectionsAllowingComments: string[],
  sendAlert: boolean,
  alertRecipients: string[],
  alertFrom: string,
  alertSubject: string,
  alertIntro: string,
  alertClosing: string,
  alertEditUrlBase: string,
  autoPublish: boolean,
  autoPublishConditions: string[],
}

export type IncomingOptions = { // Same as CommentOptions, but properties optional
  slug?: string,
  singularLabel?: string,
  admin?: CollectionAdminOptions,
  fields?: Field[],
  timestamps?: boolean,
  addCommentPath?: string,
  addCommentMethod?: 'get'|'post',
  hasPublishedCommentPath?: string,
  hasPublishedCommentMethod?: 'get'|'post',
  hasPublishedCommentFields?: string[],
  additionalEndpoints?: Omit<Endpoint, "root">[],
  collectionsAllowingComments?: string[],
  sendAlert?: boolean,
  alertRecipients?: string[],
  alertFrom?: string,
  alertSubject?: string,
  alertIntro?: string,
  alertClosing?: string,
  alertEditUrlBase?: string,
  autoPublish?: boolean,
  autoPublishConditions?: string[],
}

export type BodyObj = {
  [key: string]: string;
}
