'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTRPC } from '@/trpc/client';
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import {
  CheckIcon,
  Loader2Icon,
  CopyIcon,
  Globe2Icon,
  ImagePlusIcon,
  LockIcon,
  MoreVerticalIcon,
  RotateCcwIcon,
  SparkleIcon,
  TrashIcon,
  RefreshCcwIcon,
} from 'lucide-react';
import { Suspense, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { videoUpdateSchema } from '@/db/schema';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { VideoPlayer } from '@/modules/videos/ui/components/video-player';
import Link from 'next/link';
import { snakeCaseToTile } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { THUMBNAIL_FALLBACK } from '@/modules/videos/constants';
import { ThumbnailUploadModal } from '@/modules/studio/ui/components/thumbnail-upload-modal';
import { ThumbnailGenerateModal } from '@/modules/studio/ui/components/thumbnail-generate-modal';
import { Skeleton } from '@/components/ui/skeleton';
import { APP_URL } from '@/constants';

interface FormSectionProps {
  videoId: string;
}

export const FormSection = ({ videoId }: FormSectionProps) => {
  return (
    <Suspense fallback={<FormSectionSkeleton />}>
      <ErrorBoundary fallback={<div>Error</div>}>
        <FormSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

const FormSectionSkeleton = () => {
  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div className='space-y-2'>
          <Skeleton className='h-7 w-32' />
          <Skeleton className='h-4 w-40' />
        </div>
        <Skeleton className='h-9 w-24' />
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
        <div className='space-y-8 lg:col-span-3'>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-16' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-24' />
            <Skeleton className='h-[220px] w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-[84px] w-[153px]' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-5 w-20' />
            <Skeleton className='h-10 w-[153px]' />
          </div>
        </div>
        <div className='flex flex-col gap-y-8 lg:col-span-2'>
          <div className='flex flex-col gap-4 bg-[#F9F9F9] rounded-xl overflow-hidden'>
            <Skeleton className='aspect-video' />
            <div className='px-4 py-4 space-y-6'>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-20' />
                <Skeleton className='h-5 w-full' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-5 w-32' />
              </div>
              <div className='space-y-2'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='h-5 w-32' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FormSectionSuspense = ({ videoId }: FormSectionProps) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [thumbnailGenerateModalOpen, setThumbnailGenerateModalOpen] =
    useState(false);

  const { data: video } = useSuspenseQuery(
    trpc.studio.getOne.queryOptions({
      id: videoId,
    })
  );

  const { data: categories } = useSuspenseQuery(
    trpc.categories.getMany.queryOptions()
  );

  const update = useMutation(
    trpc.videos.update.mutationOptions({
      onSuccess: () => {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getMany.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({
              id: videoId,
            }),
          }),
          toast.success('Video updated successfully'),
        ]);
      },
      onError: () => {
        toast.error('Failed to update video');
      },
    })
  );

  const remove = useMutation(
    trpc.videos.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.studio.getMany.queryKey(),
        });
        toast.success('Video deleted successfully');
        router.push('/studio');
      },
      onError: () => {
        toast.error('Failed to delete video');
      },
    })
  );

  const revalidate = useMutation(
    trpc.videos.revalidate.mutationOptions({
      onSuccess: () => {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getMany.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({
              id: videoId,
            }),
          }),
        ]);
        toast.success('Video revalidated successfully');
      },
      onError: () => {
        toast.error('Failed to revalidate video');
      },
    })
  );

  const restoreThumbnail = useMutation(
    trpc.videos.restoreThumbnail.mutationOptions({
      onSuccess: () => {
        Promise.all([
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getMany.queryKey(),
          }),
          queryClient.invalidateQueries({
            queryKey: trpc.studio.getOne.queryKey({
              id: videoId,
            }),
          }),
        ]);
        toast.success('Thumbnail restored successfully');
      },
      onError: () => {
        toast.error('Failed to restore thumbnail');
      },
    })
  );

  const generateTitle = useMutation(
    trpc.videos.generateTitle.mutationOptions({
      onSuccess: () => {
        toast.success('Title generated successfully');
      },
      onError: () => {
        toast.error('Failed to generate title');
      },
    })
  );

  const generateDescription = useMutation(
    trpc.videos.generateDescription.mutationOptions({
      onSuccess: () => {
        toast.success('Description generated successfully');
      },
      onError: () => {
        toast.error('Failed to generate description');
      },
    })
  );

  const form = useForm<z.infer<typeof videoUpdateSchema>>({
    resolver: zodResolver(videoUpdateSchema),
    defaultValues: video,
  });

  const onSubmit = (data: z.infer<typeof videoUpdateSchema>) => {
    update.mutate(data);
  };

  const fullUrl = `${APP_URL}/videos/${videoId}`;
  const [isCopied, setIsCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <ThumbnailUploadModal
        videoId={videoId}
        open={thumbnailModalOpen}
        onOpenChange={setThumbnailModalOpen}
      />
      <ThumbnailGenerateModal
        videoId={videoId}
        open={thumbnailGenerateModalOpen}
        onOpenChange={setThumbnailGenerateModalOpen}
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-2xl font-bold'>Video Details</h1>
              <p className='text-sm text-muted-foreground'>
                Manage your video details
              </p>
            </div>
            <div className='flex items-center gap-x-2'>
              <Button type='submit' disabled={update.isPending}>
                Save
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon'>
                    <MoreVerticalIcon />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => remove.mutate({ id: videoId })}
                    disabled={remove.isPending}
                  >
                    <TrashIcon className='size-4 mr-2' />
                    Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => revalidate.mutate({ id: videoId })}
                    disabled={revalidate.isPending}
                  >
                    <RefreshCcwIcon className='size-4 mr-2' />
                    Revalidate
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
            <div className='space-y-8 lg:col-span-3'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className='flex items-center gap-x-2'>
                        Title
                        <Button
                          size='icon'
                          variant='outline'
                          type='button'
                          className='rounded-full size-6 [&_svg]:size-3'
                          onClick={() => generateTitle.mutate({ id: videoId })}
                          disabled={generateTitle.isPending}
                        >
                          {generateTitle.isPending ? (
                            <Loader2Icon className='size-3 animate-spin' />
                          ) : (
                            <SparkleIcon className='size-3' />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder='Add a title to your video'
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
                    <FormLabel>
                      <div className='flex items-center gap-x-2'>
                        Description
                        <Button
                          size='icon'
                          variant='outline'
                          type='button'
                          className='rounded-full size-6 [&_svg]:size-3'
                          onClick={() =>
                            generateDescription.mutate({ id: videoId })
                          }
                          disabled={
                            generateDescription.isPending || !video.muxTrackId
                          }
                        >
                          {generateDescription.isPending ? (
                            <Loader2Icon className='size-3 animate-spin' />
                          ) : (
                            <SparkleIcon className='size-3' />
                          )}
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        rows={10}
                        className='resize-none pr-10'
                        placeholder='Add a description to your video'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name='thumbnailUrl'
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Thumbnail</FormLabel>
                    <FormControl>
                      <div className='p-0.5 border border-dashed border-neutral-400 relative h-[84px] w-[153px] group'>
                        <Image
                          fill
                          alt='Thumbnail'
                          src={video.thumbnailUrl ?? THUMBNAIL_FALLBACK}
                          className='object-cover'
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type='button'
                              size='icon'
                              className='bg-black/50 hover:bg-black/50 absolute top-1 right-1 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 duration-300 size-7'
                            >
                              <MoreVerticalIcon className='text-white' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='start' side='right'>
                            <DropdownMenuItem
                              onClick={() => setThumbnailModalOpen(true)}
                            >
                              <ImagePlusIcon className='size-4 mr-1' />
                              Change
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setThumbnailGenerateModalOpen(true)
                              }
                            >
                              <SparkleIcon className='size-4 mr-1' />
                              AI-generated
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                restoreThumbnail.mutate({
                                  id: videoId,
                                })
                              }
                            >
                              <RotateCcwIcon className='size-4 mr-1' />
                              Restore
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='categoryId'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a Category' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className='flex flex-col gap-y-8 lg:col-span-2'>
              <div className='flex flex-col gap-4 bg-[#f9f9f9] rounded-xl overflow-hidden h-fit'>
                <div className='aspect-video overflow-hidden relative'>
                  <VideoPlayer
                    playbackId={video.muxPlaybackId}
                    thumbnailUrl={video.thumbnailUrl}
                  />
                </div>
                <div className='p-4 flex flex-col gap-y-6'>
                  <div className='flex justify-between items-center gap-x-2'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>
                        Video Link
                      </p>
                      <div className='flex items-center gap-x-2'>
                        <Link href={`/videos/${videoId}`}>
                          <p className='line-clamp-1 text-sm text-blue-500'>
                            http://localhost:3000/123
                          </p>
                        </Link>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          className='shrink-0'
                          onClick={onCopy}
                          disabled={isCopied}
                        >
                          {isCopied ? (
                            <CheckIcon className='size-4 text-green-500' />
                          ) : (
                            <CopyIcon className='size-4' />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>
                        Video Status
                      </p>
                      <p className='text-sm'>
                        {snakeCaseToTile(video.muxStatus || 'preparing')}
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-between items-center'>
                    <div className='flex flex-col gap-y-1'>
                      <p className='text-muted-foreground text-xs'>
                        Subtitles status
                      </p>
                      <p className='text-sm'>
                        {snakeCaseToTile(
                          video.muxTrackStatus || 'no_subtitles'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name='visibility'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Select a Visibility' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='public'>
                          <div className='flex items-center gap-x-2'>
                            <Globe2Icon className='size-4 mr-2' />
                            Public
                          </div>
                        </SelectItem>
                        <SelectItem value='private'>
                          <div className='flex items-center gap-x-2'>
                            <LockIcon className='size-4 mr-2' />
                            Private
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};
