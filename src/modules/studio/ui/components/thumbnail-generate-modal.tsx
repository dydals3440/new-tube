'use client';

import { z } from 'zod';

import { ResponsiveModal } from '@/components/responsive-dialog';
import { useTRPC } from '@/trpc/client';
import { useMutation } from '@tanstack/react-query';
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ThumbnailGenerateModalProps {
  videoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  prompt: z.string().min(10),
});

export const ThumbnailGenerateModal = ({
  videoId,
  open,
  onOpenChange,
}: ThumbnailGenerateModalProps) => {
  const trpc = useTRPC();
  const toast = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
    },
  });

  const generateThumbnail = useMutation(
    trpc.videos.generateThumbnail.mutationOptions({
      onSuccess: () => {
        toast.toast({
          title: 'Thumbnail generated successfully',
        });
        form.reset();
        onOpenChange(false);
      },
      onError: () => {
        toast.toast({
          title: 'Failed to restore thumbnail',
        });
      },
    })
  );

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    generateThumbnail.mutate({
      prompt: values.prompt,
      id: videoId,
    });
  };

  return (
    <ResponsiveModal
      title='Upload Thumbnail'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='flex flex-col gap-4'
        >
          <FormField
            control={form.control}
            name='prompt'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className='resize-none'
                    cols={30}
                    rows={5}
                    placeholder='A description of wanted thumbnail'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='flex justify-end'>
            <Button type='submit' disabled={generateThumbnail.isPending}>
              {generateThumbnail.isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveModal>
  );
};
