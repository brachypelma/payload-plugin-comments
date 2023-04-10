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

  if (
    !hasPublishedCommentAuthorField ||
    !slug ||
    !bodyAuthor ||
    typeof bodyAuthor !== 'string'
  ) {
    return response(false, res)
  }

  const hasApprovedComment = await getHasApprovedComment(
    bodyAuthor, hasPublishedCommentAuthorField, slug
  )

  return response(hasApprovedComment, res)
}

function response(hasPublishedComment: boolean, res: Response) {
  return res.status(200).json(hasPublishedComment)
}

async function getHasApprovedComment(
  bodyAuthor: string,
  hasPublishedCommentAuthorField: string,
  slug: string,
): Promise<boolean> {
  const where: Where = {
    isApproved: {
      equals: true
    }
  }
  where[hasPublishedCommentAuthorField] = { equals: bodyAuthor }

  const post = await payload.find({
    collection: slug,
    limit: 1,
    where,
  })

  return post?.docs?.length > 0
}
