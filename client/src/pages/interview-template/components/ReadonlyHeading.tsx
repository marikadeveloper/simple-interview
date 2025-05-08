import { Button } from '@/components/ui/button';
import { PageSubtitle } from '@/components/ui/page-subtitle';
import { PageTitle } from '@/components/ui/page-title';
import { InterviewTemplateFragment } from '@/generated/graphql';
import { Pencil } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router';

interface ReadonlyHeadingProps {
  interviewTemplate: InterviewTemplateFragment;
  setFormVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ReadonlyHeading: React.FC<ReadonlyHeadingProps> = ({
  interviewTemplate,
  setFormVisible,
}) => (
  <div className='w-full flex justify-between'>
    <div>
      <PageTitle>{interviewTemplate.name}</PageTitle>
      <PageSubtitle>{interviewTemplate.description}</PageSubtitle>
      <div className='mt-3'>
        {interviewTemplate.tags?.map((tag) => (
          <Link
            to={`/interview-templates?tags=${tag.id}`}
            key={tag.id}
            className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-sm font-medium text-gray-800 mr-2'>
            {tag.text}
          </Link>
        ))}
      </div>
    </div>
    <div className='flex gap-2'>
      <Button
        variant='outline'
        onClick={() => setFormVisible(true)}>
        <Pencil />
      </Button>
    </div>
  </div>
);
