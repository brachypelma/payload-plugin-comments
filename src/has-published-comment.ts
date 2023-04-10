import { CommentOptions } from "./types"
import payload from "payload"
import { Request, Response } from "express"
import { Where } from "payload/types"

export default async function hasPublishedComment(
  { body }: Request,
  res: Response<any, Record<string, any>>,
  options: CommentOptions,
) {
  const { hasPublishedCommentAuthorField, slug } = options
  const bodyAuthor = body && typeof body === 'object'
    ? body[hasPublishedCommentAuthorField] : false
  let hasPublishedComment = false

  if (
    !hasPublishedCommentAuthorField ||
    !slug ||
    !bodyAuthor ||
    typeof bodyAuthor !== 'string'
  ) {
    return res.status(200).json(hasPublishedComment)
  }

  const where: Where = {
    isApproved: {
      equals: true
    }
  }
  where[hasPublishedCommentAuthorField] = { equals: bodyAuthor }

  const { docs } = await payload.find({
    collection: slug,
    limit: 1,
    where,
  })
  hasPublishedComment = docs?.length > 0

  return res.status(200).json(hasPublishedComment)
}
