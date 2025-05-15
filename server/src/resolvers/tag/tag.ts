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
import { errorStrings } from '../../utils/errorStrings';

@Resolver(Tag)
export class TagResolver {
  @Query(() => [Tag], { nullable: true })
  @UseMiddleware(isAuth)
  async getTags(): Promise<Tag[] | null> {
    const tags = await Tag.find({
      order: { text: 'ASC' },
    });
    return tags;
  }

  @Mutation(() => Tag, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async createTag(@Arg('text') text: string): Promise<Tag | null> {
    // convert text to lowercase
    text = text.toLowerCase();

    // check if tag is empty
    if (text.trim() === '') {
      throw new Error(errorStrings.tag.emptyText);
    }

    const existingTag = await Tag.findOne({
      where: { text },
    });
    if (existingTag) {
      throw new Error(errorStrings.tag.duplicate);
    }

    const tag = Tag.create({
      text,
    });
    await tag.save();
    return tag;
  }

  @Mutation(() => Tag, { nullable: true })
  @UseMiddleware(isAuth)
  @UseMiddleware(isAdminOrInterviewer)
  async updateTag(
    @Arg('id', () => Int) id: number,
    @Arg('text') text: string,
  ): Promise<Tag | null> {
    // convert text to lowercase
    text = text.toLowerCase();

    // check if tag is empty
    if (text.trim() === '') {
      throw new Error(errorStrings.tag.emptyText);
    }

    const existingTag = await Tag.findOne({
      where: { text, id: Not(id) },
    });
    if (existingTag) {
      throw new Error(errorStrings.tag.duplicate);
    }

    const tag = await Tag.findOneOrFail({
      where: { id },
    });
    tag.text = text;
    await tag.save();
    return tag;
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
