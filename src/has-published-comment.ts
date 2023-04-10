import { PaginatedDocs } from "payload/dist/mongoose/types"
import { CommentOptions } from "./types"
import payload from "payload"
import { Request, Response } from "express"
import { Field, FieldBase } from "payload/dist/fields/config/types"

export default async function hasPublishedComment(
  { body }: Request,
  res: Response<any, Record<string, any>>,
  options: CommentOptions,
) {
  
}
