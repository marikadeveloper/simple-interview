import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useAddQuestionsFromQuestionBankMutation,
  useGetQuestionBankQuery,
  useGetQuestionBanksQuery,
} from '@/generated/graphql';
import { Database, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';

interface QuestionBankSelectorProps {
  templateId: string;
}

export const QuestionBankSelector: React.FC<QuestionBankSelectorProps> = ({
  templateId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQuestionBankId, setSelectedQuestionBankId] = useState<
    number | null
  >(null);
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [{ data: questionBanksData }] = useGetQuestionBanksQuery();
  const [{ data: selectedQuestionBankData }] = useGetQuestionBankQuery({
    variables: { id: selectedQuestionBankId! },
    pause: !selectedQuestionBankId,
  });
  const [, addQuestionsFromQuestionBank] =
    useAddQuestionsFromQuestionBankMutation();

  const questionBanks = questionBanksData?.getQuestionBanks || [];
  const selectedQuestionBank = selectedQuestionBankData?.getQuestionBank;

  // Filter questions based on search query
  const filteredQuestions = useMemo(() => {
    if (!selectedQuestionBank?.questions || !searchQuery.trim()) {
      return selectedQuestionBank?.questions || [];
    }

    const query = searchQuery.toLowerCase();
    return selectedQuestionBank.questions.filter(
      (question) =>
        question.title.toLowerCase().includes(query) ||
        question.description.toLowerCase().includes(query),
    );
  }, [selectedQuestionBank?.questions, searchQuery]);

  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (!filteredQuestions) return;

    // Check if all filtered questions are selected
    const allFilteredSelected = filteredQuestions.every((q) =>
      selectedQuestions.includes(q.id),
    );

    if (allFilteredSelected) {
      // Deselect all filtered questions
      setSelectedQuestions((prev) =>
        prev.filter((id) => !filteredQuestions.some((q) => q.id === id)),
      );
    } else {
      // Select all filtered questions
      setSelectedQuestions((prev) => {
        const newIds = filteredQuestions.map((q) => q.id);
        const uniqueIds = [...new Set([...prev, ...newIds])];
        return uniqueIds;
      });
    }
  };

  const handleAddQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    try {
      const { data, error } = await addQuestionsFromQuestionBank({
        input: {
          interviewTemplateId: parseInt(templateId),
          questionIds: selectedQuestions,
        },
      });

      if (error) {
        toast.error('Failed to add questions');
        return;
      }

      if (data?.addQuestionsFromQuestionBank) {
        toast.success(
          `Successfully added ${selectedQuestions.length} questions to the template`,
        );
        setIsOpen(false);
        setSelectedQuestionBankId(null);
        setSelectedQuestions([]);
        setSearchQuery('');
      }
    } catch (error) {
      toast.error('An error occurred while adding questions');
    }
  };

  return (
    <>
      <Card className='w-full bg-blue-50 border-blue-200 border-dashed border-2 shadow-none'>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Database className='h-5 w-5 text-blue-600' />
              <CardTitle className='text-blue-800'>
                Add from Question Bank
              </CardTitle>
            </div>
          </div>
          <CardDescription className='text-blue-600'>
            Select questions from existing question banks to add to this
            template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant='outline'
            onClick={() => setIsOpen(true)}
            className='border-blue-300 text-blue-700 hover:bg-blue-100'>
            Browse Question Banks
          </Button>
        </CardContent>
      </Card>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}>
        <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col'>
          <DialogHeader>
            <DialogTitle>Add Questions from Question Bank</DialogTitle>
            <DialogDescription>
              Select a question bank and choose which questions to add to your
              interview template.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 flex-1 overflow-hidden'>
            {/* Question Bank Selector */}
            <div className='grid gap-3'>
              <label className='text-sm font-medium'>Question Bank</label>
              <Select
                value={selectedQuestionBankId?.toString() || ''}
                onValueChange={(value) => {
                  const id = value ? parseInt(value) : null;
                  setSelectedQuestionBankId(id);
                  setSelectedQuestions([]);
                  setSearchQuery(''); // Clear search when changing question bank
                }}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Select question bank' />
                </SelectTrigger>
                <SelectContent>
                  {questionBanks.map((bank) => (
                    <SelectItem
                      key={bank.id}
                      value={bank.id.toString()}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Questions List */}
            {selectedQuestionBank && (
              <div className='space-y-3 flex-1 overflow-hidden'>
                <div className='flex items-center justify-between'>
                  <label className='text-sm font-medium'>
                    Questions ({filteredQuestions.length} of{' '}
                    {selectedQuestionBank.questions?.length || 0})
                  </label>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleSelectAll}>
                    {filteredQuestions.every((q) =>
                      selectedQuestions.includes(q.id),
                    )
                      ? 'Deselect All'
                      : 'Select All'}
                  </Button>
                </div>

                {/* Search Input */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                  <Input
                    placeholder='Search questions...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='pl-10'
                  />
                </div>

                <div className='border rounded-md p-2 max-h-[300px] overflow-y-auto'>
                  <div className='space-y-3'>
                    {filteredQuestions.length > 0 ? (
                      filteredQuestions.map((question) => (
                        <div
                          key={question.id}
                          className='flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50'>
                          <Checkbox
                            id={`question-${question.id}`}
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() =>
                              handleQuestionToggle(question.id)
                            }
                          />
                          <div className='flex-1 min-w-0'>
                            <label
                              htmlFor={`question-${question.id}`}
                              className='text-sm font-medium cursor-pointer'>
                              {question.title}
                            </label>
                          </div>
                        </div>
                      ))
                    ) : selectedQuestionBank.questions?.length === 0 ? (
                      <p className='text-sm text-gray-500 text-center py-4'>
                        No questions in this question bank
                      </p>
                    ) : (
                      <p className='text-sm text-gray-500 text-center py-4'>
                        No questions match your search
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                setIsOpen(false);
                setSelectedQuestionBankId(null);
                setSelectedQuestions([]);
                setSearchQuery('');
              }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddQuestions}
              disabled={selectedQuestions.length === 0}>
              Add {selectedQuestions.length} Question
              {selectedQuestions.length !== 1 ? 's' : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
