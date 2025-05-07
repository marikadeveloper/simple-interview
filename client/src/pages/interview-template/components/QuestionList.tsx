import { QuestionFragment } from '@/generated/graphql';
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { QuestionCard } from './QuestionCard';
import { isQuestionData } from './utils';

export const QuestionList = ({
  questions: dataQuestions,
}: {
  questions: QuestionFragment[];
}) => {
  const [questions, setQuestions] = useState<QuestionFragment[]>(dataQuestions);

  useEffect(() => {
    return monitorForElements({
      canMonitor({ source }) {
        return isQuestionData(source.data);
      },
      onDrop({ location, source }) {
        const target = location.current.dropTargets[0];
        if (!target) {
          return;
        }

        const sourceData = source.data;
        const targetData = target.data;

        if (!isQuestionData(sourceData) || !isQuestionData(targetData)) {
          return;
        }

        const indexOfSource = questions.findIndex(
          (question) => question.id === sourceData.questionId,
        );
        const indexOfTarget = questions.findIndex(
          (question) => question.id === targetData.questionId,
        );

        if (indexOfTarget < 0 || indexOfSource < 0) {
          return;
        }

        const closestEdgeOfTarget = extractClosestEdge(targetData);

        // Using `flushSync` so we can query the DOM straight after this line
        flushSync(() => {
          setQuestions(
            reorderWithEdge({
              list: questions,
              startIndex: indexOfSource,
              indexOfTarget,
              closestEdgeOfTarget,
              axis: 'vertical',
            }),
          );
        });
        // Being simple and just querying for the task after the drop.
        // We could use react context to register the element in a lookup,
        // and then we could retrieve that element after the drop and use
        // `triggerPostMoveFlash`. But this gets the job done.
        const element = document.querySelector(
          `[data-question-id="${sourceData.questionId}"]`,
        );
        if (element instanceof HTMLElement) {
          triggerPostMoveFlash(element);
        }
      },
    });
  }, [questions]);

  return (
    <div className='flex flex-col gap-4'>
      {questions?.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
        />
      ))}
    </div>
  );
};
