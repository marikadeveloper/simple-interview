import {
  Arg,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from 'type-graphql';
import { Not } from 'typeorm';
import { Tag } from '../../entities/Tag';
import { isAdminOrInterviewer } from '../../middleware/isAdminOrInterviewer';
import { isAuth } from '../../middleware/isAuth';
import { TagMultipleResponse, TagSingleResponse } from './tag-types';

@Resolver(Tag)
export class TagResolver {
  @Query(() => TagMultipleResponse)
  @UseMiddleware(isAuth)
  async getTags(): Promise<TagMultipleResponse> {
    const tags = await Tag.find({
      order: { text: 'ASC' },
    });
    return { tags };
  }

  @Mutation(() => TagSingleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createTag(@Arg('text') text: string): Promise<TagSingleResponse> {
    // convert text to lowercase
    text = text.toLowerCase();

    // check if tag is empty
    if (text.trim() === '') {
      return {
        errors: [{ field: 'text', message: 'Tag cannot be empty' }],
      };
    }

    const existingTag = await Tag.findOne({
      where: { text },
    });
    if (existingTag) {
      return {
        errors: [{ field: 'text', message: 'Tag already exists' }],
      };
    }

    const tag = Tag.create({
      text,
    });
    await tag.save();
    return { tag };
  }

  @Mutation(() => TagSingleResponse)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateTag(
    @Arg('id', () => Int) id: number,
    @Arg('text') text: string,
  ): Promise<TagSingleResponse> {
    // convert text to lowercase
    text = text.toLowerCase();

    // check if tag is empty
    if (text.trim() === '') {
      return {
        errors: [{ field: 'text', message: 'Tag cannot be empty' }],
      };
    }

    const existingTag = await Tag.findOne({
      where: { text, id: Not(id) },
    });
    if (existingTag) {
      return {
        errors: [{ field: 'text', message: 'Tag already exists' }],
      };
    }

    const tag = await Tag.findOneOrFail({
      where: { id },
    });
    tag.text = text;
    await tag.save();
    return { tag };
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async deleteTag(@Arg('id', () => Int) id: number): Promise<boolean> {
    const tag = await Tag.delete({ id });
    if (!tag.affected) {
      return false;
    }
    return true;
  }
}
