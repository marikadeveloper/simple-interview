import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InterviewTemplateFragment,
  useGetTagsQuery,
  useUpdateInterviewTemplateTagsMutation,
} from '@/generated/graphql';
import { Checkbox } from '@radix-ui/react-checkbox';
import React from 'react';

interface EditTemplateTagsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  template: InterviewTemplateFragment;
}
export const EditTemplateTagsDialog: React.FC<EditTemplateTagsDialogProps> = ({
  isOpen,
  setIsOpen,
  template,
}) => {
  const [{ data: tagsData }] = useGetTagsQuery();
  const [, updateInterviewTemplateTags] =
    useUpdateInterviewTemplateTagsMutation();
  const [selectedTags, setSelectedTags] = React.useState<number[]>(() =>
    template.tags.map((tag) => tag.id),
  );

  const toggleTagSelection = (tagId: number) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  };

  const handleTagsUpdate = async () => {
    const tagsList =
      tagsData?.getTags
        .filter((tag) => selectedTags.includes(tag.id))
        .map((tag) => tag.text) || [];

    await updateInterviewTemplateTags({
      id: template.id,
      tags: tagsList,
    });
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogContent className='sm:max-w-[525px]'>
        <DialogHeader>
          <DialogTitle>Manage Tags</DialogTitle>
          <DialogDescription>
            Select tags for {template?.name}
          </DialogDescription>
        </DialogHeader>
        <div className='max-h-[300px] overflow-y-auto'>
          {tagsData?.getTags?.map((tag) => (
            <div
              key={tag.id}
              className='flex items-center space-x-2 py-2'>
              <Checkbox
                id={`tag-${tag.id}`}
                checked={selectedTags.includes(tag.id)}
                onCheckedChange={() => toggleTagSelection(tag.id)}
              />
              <label
                htmlFor={`tag-${tag.id}`}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
                {tag.text}
              </label>
            </div>
          ))}
          {(!tagsData?.getTags || tagsData.getTags.length === 0) && (
            <div className='text-center py-4 text-muted-foreground'>
              No tags available. Create some tags first.
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleTagsUpdate}>Save Tags</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
