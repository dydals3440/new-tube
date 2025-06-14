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

interface CommentFormProps {
  videoId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  variant?: 'reply' | 'comment';
  parentId?: string;
}

// commentFormSchema 분리 선언
const commentFormSchema = commentInsertSchema.omit({ userId: true });

export const CommentForm = ({
  videoId,
  onSuccess,
  onCancel,
  variant = 'comment',
  parentId,
}: CommentFormProps) => {
  const { user } = useUser();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const clerk = useClerk();

  // 타입 추론 및 적용
  const form = useForm<z.infer<typeof commentFormSchema>>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      parentId,
      videoId,
      value: '',
    },
  });

  const create = useMutation(
    trpc.comments.create.mutationOptions({
      onSuccess: () => {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.comments.getMany.queryKey({ videoId }),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.comments.getMany.queryKey({ videoId, parentId }),
          }),
        ]);

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

  const handleCancel = () => {
    form.reset();
    onCancel?.();
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
                    placeholder={
                      variant === 'reply'
                        ? 'Reply to this comment...'
                        : 'Add a comment...'
                    }
                    className='resize-none bg-transparent overflow-hidden min-h-0'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='justify-end gap-2 mt-2 flex'>
          {onCancel && (
            <Button variant='ghost' size='sm' onClick={handleCancel}>
              Cancel
            </Button>
          )}
          <Button type='submit' size='sm'>
            {variant === 'reply' ? 'Reply' : 'Comment'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
