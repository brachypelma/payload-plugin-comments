import { PaginatedDocs } from "payload/dist/mongoose/types"
import { CommentOptions } from "./types"
import payload from "payload"
import { Request, Response } from "express"
import { Field, FieldBase } from "payload/dist/fields/config/types"

export default async function processComment(
  { body }: Request,
  res: Response<any, Record<string, any>>,
  options: CommentOptions
) {
  const {
    sendAlert,
    alertFrom,
    alertRecipients,
    collectionsAllowingComments,
    fields,
    slug,
  } = options
  
  if (!collectionsAllowingComments.length) {
    return response(res, 'Your site is not configured to accept your submission.')
  }
  
  const replyPost = await getReplyPost(body.id, collectionsAllowingComments)
  if (!replyPost) {
    return response(res, 'We were unable to find a target for your submission.')
  }

  const isApproved = getIsApproved(body, options)
  const data = getNewCommentData(body, fields, isApproved)
  if (!data) {
    return response(res, 'We encountered an unexpected error while processing your submission.')
  }

  const newComment = await payload.create({ collection: slug, data })
  if (!newComment) {
    return response(res, 'We encountered an unexpected error while processing your submission.')
  }

  // New comment created
  if (sendAlert && alertRecipients.length && alertFrom) {
    sendNewCommentAlert(data, options, newComment, isApproved)
  }
  return response(res, false, 200, true, isApproved)
}

function response(
  res: Response,
  error: boolean|string = false,
  status = 200,
  saved = false,
  isApproved = false,
) {
  const baseJson = { saved, isApproved }
  const json = error ? { ...baseJson, error } : baseJson
  return res.status(status).json(json)
}

async function getReplyPost(
  id: string,
  collectionsToSearch: string[],
  index = 0
): Promise<PaginatedDocs<any>|false> {
  const post = await payload.find({
    collection: collectionsToSearch[index],
    limit: 1,
    where: { id: { equals: id } },
  })

  if (post) return post

  const moreToSearch = ++index < (collectionsToSearch.length - 1)

  return moreToSearch ? getReplyPost(id, collectionsToSearch, index) : false
}

function getIsApproved(body: any, options: CommentOptions) {
  const { autoPublish, autoPublishConditions } = options
  
  if (!autoPublish || !body) return false
  if (!autoPublishConditions?.length) return true

  return autoPublishConditions.filter(cond => !body[cond]).length === 0
}

function getNewCommentData(
  body: any, fields: Field[], isApproved: boolean,
): false|Record<string, unknown> {
  if (typeof body !== 'object' || !body) return false

  const commentData: Record<string, unknown> = {}
  const fieldsWthNames = fields as FieldBase[]

  fieldsWthNames.forEach(({ name, defaultValue }) => {
    if (body[name]) {
      commentData[name] = body[name]
    } else if (typeof defaultValue !== 'undefined') {
      commentData[name] = defaultValue
    }
  })

  return { ...commentData, isApproved }
}

function sendNewCommentAlert(
  data: Record<string, unknown>,
  options: CommentOptions,
  newComment: any,
  isApproved: boolean,
) {
  const { alertFrom, alertRecipients, alertSubject } = options

  payload.sendEmail({
    to: alertRecipients.join(', '),
    from: alertFrom,
    subject: alertSubject,
    html: getNewCommentHtml(data, options, newComment, isApproved),
  })
}

function getNewCommentHtml(
  data: Record<string, unknown>,
  options: CommentOptions,
  newComment: any,
  isApproved: boolean,
) {
  const {
    alertEditUrlBase,
    alertIntro,
    alertClosing,
    singularLabel,
    slug,
  } = options
  let html = `
    ${alertIntro}
    <p>Information about this ${singularLabel}:</p>
    <table>
      <thead>
        <tr>
          <th>
            Field
          </th>
          <th>
            Value
          </th>
        </tr>
      </thead>
      <tbody>`

  Object.keys(data).forEach(key => {
    html += `
      <tr>
        <td>
          ${key}
        </td>
        <td>
          ${data[key]}
        </td>
      </tr>`
  })

  html += '</tbody></table>'

  if (alertEditUrlBase && !isApproved && newComment?.id) {
    html += `
      <p>
        <a href="${alertEditUrlBase}/collections/${slug}/${newComment.id}">
          Click here to review, approve, reject, or delete this comment
        </a>
      </p>`
  }

  return html + alertClosing
}
