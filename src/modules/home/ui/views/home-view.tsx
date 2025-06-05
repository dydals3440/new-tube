import { CategoriesSection } from '@/modules/home/ui/sections/categories-section';

interface HomeViewProps {
  categoryId?: string;
}

export const HomeView = ({ categoryId }: HomeViewProps) => {
  return (
    <div className='max-w-[2400px] mx-auto mb-10 pt-2.5 flex flex-col gap-y-6'>
      <CategoriesSection categoryId={categoryId} />
    </div>
  );
};
