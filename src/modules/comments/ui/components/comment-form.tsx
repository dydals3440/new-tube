import { z } from 'zod';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useUser, useClerk } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';

import { useTRPC } from '@/trpc/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { UserAvatar } from '@/components/user-avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { commentInsertSchema } from '@/db/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_LIMIT } from '@/constants';

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
}

// commentFormSchema 분리 선언
const commentFormSchema = commentInsertSchema.omit({ userId: true });

export const CommentForm = ({ videoId, onSuccess }: CommentFormProps) => {
  const { user } = useUser();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const clerk = useClerk();

  // 타입 추론 및 적용
  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      videoId,
      value: '',
    },
  });

  const create = useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess: () => {
        const options = trpc.comments.getMany.infiniteQueryOptions(
          {
            videoId,
            limit: DEFAULT_LIMIT,
          },
          {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
          }
        );
        queryClient.invalidateQueries({ queryKey: options.queryKey });

        form.reset();
        toast.success('Comment created');
        onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === 'UNAUTHORIZED') {
          clerk.openSignIn();
        }
      },
    })
  );

  // handleSubmit 타입 적용
  const handleSubmit = (values: z.infer<typeof commentFormSchema>) => {
    if (!user?.id) {
      toast.error('로그인이 필요합니다.');
      clerk.openSignIn();
      return;
    }
    create.mutate(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className='flex gap-4 group'
      >
        <UserAvatar
          size='lg'
          imageUrl={user?.imageUrl || '/placeholder.svg'}
          name={user?.fullName || 'User'}
        />
        <div className='flex-1'>
          <FormField
            control={form.control}
            name='value'
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder='Add a comment...'
                    className='resize-none bg-transparent overflow-hidden min-h-0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='justify-end gap-2 mt-2 flex'>
          <Button type='submit' size='sm'>
            Comment
          </Button>
        </div>
      </form>
    </Form>
  );
};
