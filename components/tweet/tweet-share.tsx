import Link from 'next/link';
import cn from 'clsx';
import { Popover } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../lib/context/auth-context';
import { manageBookmark } from '../../lib/firebase/utils';
import { preventBubbling } from '../../lib/utils';
import { siteURL } from '../../lib/env';
import { Button } from '../ui/button';
import { HeroIcon } from '../ui/hero-icon';
import { ToolTip } from '../ui/tooltip';
import { variants } from './tweet-actions';

type TweetShareProps = {
  userId: string;
  tweetId: string;
  viewTweet?: boolean;
};

export function TweetShare({
  userId,
  tweetId,
  viewTweet
}: TweetShareProps): JSX.Element {
  const { userBookmarks } = useAuth();

  const handleBookmark =
    (closeMenu: () => void, ...args: Parameters<typeof manageBookmark>) =>
    async (): Promise<void> => {
      const [type] = args;

      closeMenu();
      await manageBookmark(...args);

      toast.success(
        type === 'bookmark'
          ? (): JSX.Element => (
              <span className='flex gap-2'>
               북마크에 추가되었습니다.
                <Link className='custom-underline font-bold' href='/bookmarks' >
                  보기
                </Link>
              </span>
            )
          : '북마크에서 삭제되었습니다.'
      );
    };

  const handleCopy = (closeMenu: () => void) => async (): Promise<void> => {
    closeMenu();
    await navigator.clipboard.writeText(`${siteURL}/tweet/${tweetId}`);
    toast.success('클립보드에 복사되었습니다.');
  };

  const tweetIsBookmarked = !!userBookmarks?.some(({ id }) => id === tweetId);

  return (
    <Popover className='relative'>
      {({ open, close }): JSX.Element => (
        <>
          <Popover.Button
            className={cn(
              `group relative flex items-center gap-1 p-0 outline-none 
               transition-none hover:text-accent-blue focus-visible:text-accent-blue`,
              open && 'text-accent-blue inner:bg-accent-blue/10'
            )}
          >
            <i
              className='relative rounded-full p-2 not-italic duration-200 group-hover:bg-accent-blue/10
                         group-focus-visible:bg-accent-blue/10 group-focus-visible:ring-2
                         group-focus-visible:ring-accent-blue/80 group-active:bg-accent-blue/20'
            >
              <HeroIcon
                className={viewTweet ? 'h-6 w-6' : 'h-5 w-5'}
                iconName='ArrowUpTrayIcon'
              />
              {!open && <ToolTip tip='Share' />}
            </i>
          </Popover.Button>
          <AnimatePresence>
            {open && (
              <Popover.Panel
                className='menu-container group absolute right-0 top-11 whitespace-nowrap text-light-primary dark:text-dark-primary'
                as={motion.div}
                {...variants}
                static
              >
                <Popover.Button
                  className='accent-tab flex w-full gap-3 rounded-md rounded-b-none p-4 hover:bg-main-sidebar-background'
                  as={Button}
                  onClick={preventBubbling(handleCopy(close))}
                >
                  <HeroIcon iconName='LinkIcon' />
                  피드링크복사
                </Popover.Button>
                {!tweetIsBookmarked ? (
                  <Popover.Button
                    className='accent-tab flex w-full gap-3 rounded-md rounded-t-none p-4 hover:bg-main-sidebar-background'
                    as={Button}
                    onClick={preventBubbling(
                      handleBookmark(close, 'bookmark', userId, tweetId)
                    )}
                  >
                    <HeroIcon iconName='BookmarkIcon' />
                    북마크추가
                  </Popover.Button>
                ) : (
                  <Popover.Button
                    className='accent-tab flex w-full gap-3 rounded-md rounded-t-none p-4 hover:bg-main-sidebar-background'
                    as={Button}
                    onClick={preventBubbling(
                      handleBookmark(close, 'unbookmark', userId, tweetId)
                    )}
                  >
                    <HeroIcon iconName='BookmarkSlashIcon' />
                    북마크에서 피드 제거
                  </Popover.Button>
                )}
              </Popover.Panel>
            )}
          </AnimatePresence>
        </>
      )}
    </Popover>
  );
}
