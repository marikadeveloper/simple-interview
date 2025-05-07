import { DropIndicator } from '@/components/DropIndicator';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  QuestionFragment,
  QuestionInput,
  useCreateQuestionMutation,
  useDeleteQuestionMutation,
  useUpdateQuestionMutation,
} from '@/generated/graphql';
import { cn } from '@/lib/utils';
import {
  attachClosestEdge,
  extractClosestEdge,
  type Edge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { zodResolver } from '@hookform/resolvers/zod';
import { GripVertical, Pencil, Trash } from 'lucide-react';
import React, { HTMLAttributes, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useForm } from 'react-hook-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';
import { getQuestionData, isQuestionData } from './utils';

type CardState =
  | {
      type: 'idle';
    }
  | {
      type: 'preview';
      container: HTMLElement;
    }
  | {
      type: 'is-dragging';
    }
  | {
      type: 'is-dragging-over';
      closestEdge: Edge | null;
    };
const stateStyles: {
  [Key in CardState['type']]?: HTMLAttributes<HTMLDivElement>['className'];
} = {
  'is-dragging': 'opacity-40',
};
const idle: CardState = { type: 'idle' };

export const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
});
interface QuestionCardProps {
  templateId?: string;
  question?: QuestionFragment;
}
export const QuestionCard: React.FC<QuestionCardProps> = ({
  templateId,
  question,
}) => {
  const mode: 'create' | 'edit' | 'unsupported' = question
    ? 'edit'
    : templateId
    ? 'create'
    : 'unsupported';
  //
  const ref = useRef<HTMLDivElement | null>(null);
  const [state, setState] = useState<CardState>(idle);
  const [formVisible, setFormVisible] = useState(!!templateId);
  //
  const [, createQuestion] = useCreateQuestionMutation();
  const [, updateQuestion] = useUpdateQuestionMutation();
  const [, deleteQuestion] = useDeleteQuestionMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: question?.title || '',
      description: question?.description || '',
    },
  });

  useEffect(() => {
    if (!question) return;

    const element = ref.current;
    invariant(element);
    return combine(
      draggable({
        element,
        getInitialData() {
          return getQuestionData(question);
        },
        onGenerateDragPreview({ nativeSetDragImage }) {
          setCustomNativeDragPreview({
            nativeSetDragImage,
            getOffset: pointerOutsideOfPreview({
              x: '16px',
              y: '8px',
            }),
            render({ container }) {
              setState({ type: 'preview', container });
            },
          });
        },
        onDragStart() {
          setState({ type: 'is-dragging' });
        },
        onDrop() {
          setState(idle);
        },
      }),
      dropTargetForElements({
        element,
        canDrop({ source }) {
          // not allowing dropping on yourself
          if (source.element === element) {
            return false;
          }
          // only allowing tasks to be dropped on me
          return isQuestionData(source.data);
        },
        getData({ input }) {
          const data = getQuestionData(question);
          return attachClosestEdge(data, {
            element,
            input,
            allowedEdges: ['top', 'bottom'],
          });
        },
        getIsSticky() {
          return true;
        },
        onDragEnter({ self }) {
          const closestEdge = extractClosestEdge(self.data);
          setState({ type: 'is-dragging-over', closestEdge });
        },
        onDrag({ self }) {
          const closestEdge = extractClosestEdge(self.data);

          // Only need to update react state if nothing has changed.
          // Prevents re-rendering.
          setState((current) => {
            if (
              current.type === 'is-dragging-over' &&
              current.closestEdge === closestEdge
            ) {
              return current;
            }
            return { type: 'is-dragging-over', closestEdge };
          });
        },
        onDragLeave() {
          setState(idle);
        },
        onDrop() {
          setState(idle);
        },
      }),
    );
  }, [question]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const input: QuestionInput = {
      title: values.title,
      description: values.description,
    };
    if (mode === 'edit') {
      if (!question) return; // Ensures question is defined
      await updateQuestion({
        id: question.id,
        input,
      });
      setFormVisible(false);
    } else if (mode === 'create') {
      if (!templateId) return; // Ensures templateId is defined
      await createQuestion({
        interviewTemplateId: parseInt(templateId),
        input,
      });
      form.reset();
    }
  };

  const handleQuestionDelete = async () => {
    if (mode === 'edit') {
      if (!question) return; // Ensures question is defined
      await deleteQuestion({
        id: question.id,
      });
    }
  };

  const handleCancel = () => {
    if (mode === 'edit') {
      setFormVisible(false);
    }
    form.reset();
  };

  return (
    <>
      <div className='relative'>
        <Card
          data-question-id={question ? question.id : undefined}
          ref={ref}
          className={cn(
            'w-full bg-white',
            formVisible ? 'gap-6' : 'gap-2',
            mode === 'create' && 'border-dashed border-2 shadow-none',
            mode === 'edit' && 'hover:bg-slate-50 hover:cursor-grab',
            stateStyles[state.type] ?? '',
          )}>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                {mode === 'edit' && <GripVertical size={16} />}
                <CardTitle>
                  {question ? form.watch('title') : 'Create Question'}
                </CardTitle>
              </div>
              {question && formVisible && (
                <Button
                  variant='outline'
                  onClick={handleQuestionDelete}>
                  <Trash />
                </Button>
              )}
              {question && !formVisible && (
                <Button
                  variant='outline'
                  onClick={() => setFormVisible(true)}>
                  <Pencil />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className={formVisible ? 'hidden' : 'block'}>
              {form.watch('description')}
            </p>
            <div className={!formVisible ? `hidden` : ''}>
              <Form {...form}>
                <form
                  id={`question-form-${question?.id || 'new'}`}
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className='space-y-4'>
                  <FormField
                    control={form.control}
                    name='title'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Enter question title'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='description'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder='Enter question description'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </div>
          </CardContent>
          <CardFooter
            className={cn(
              'flex justify-between',
              !formVisible ? `hidden` : '',
            )}>
            <Button
              variant='outline'
              onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type='submit'
              form={`question-form-${question?.id || 'new'}`}>
              Save
            </Button>
          </CardFooter>
        </Card>
        {state.type === 'is-dragging-over' && state.closestEdge ? (
          <DropIndicator
            edge={state.closestEdge}
            gap={'4px'}
          />
        ) : null}
      </div>
      {state.type === 'preview' && question
        ? createPortal(<DragPreview question={question} />, state.container)
        : null}
    </>
  );
};

// A simplified version of our card for the user to drag around
function DragPreview({ question }: { question: QuestionFragment }) {
  return (
    <div className='border-solid rounded p-2 bg-white'>{question.title}</div>
  );
}
