import { AnimatePresence, motion } from 'framer-motion';
import { Menu } from '@headlessui/react';
import cn from 'clsx';
import { useAuth } from '../../lib/context/auth-context';
import { useModal } from '../../lib/hooks/useModal';
import { Modal } from '../modal/modal';
import { ActionModal } from '../modal/action-modal';
import { Button } from '../ui/button';
import { HeroIcon } from '../ui/hero-icon';
import { CustomIcon } from '../ui/custom-icon';
import { UserAvatar } from '../user/user-avatar';
import { UserName } from '../user/user-name';
import { UserUsername } from '../user/user-username';
import { variants } from './more-settings';
import type { User } from '../../lib/types/user';

export function SidebarProfile(): JSX.Element {
  const { user, signOut } = useAuth();
  const { open, openModal, closeModal } = useModal();

  const { name, username, verified, photoURL } = user as User;

  return (
    <>
      <Modal
        modalClassName='max-w-xs bg-main-background w-full p-8 rounded-2xl'
        open={open}
        closeModal={closeModal}
      >
        <ActionModal
          useIcon
          focusOnMainBtn
          title='로그아웃 하시겠습니까?'
          description='언제든지 다시 로그인할 수 있습니다. 계정을 전환하려는 경우 기존 계정을 추가하여 전환(베타 이후)할 수 있습니다.'
          mainBtnLabel='로그아웃'
          action={signOut}
          closeModal={closeModal}
        />
      </Modal>
      <Menu className='relative' as='section'>
        {({ open }): JSX.Element => (
          <>
            <Menu.Button
              className={cn(
                `custom-button main-tab dark-bg-tab flex w-full items-center 
                 justify-between hover:bg-light-primary/10 active:bg-light-primary/20
                 dark:hover:bg-dark-primary/10 dark:active:bg-dark-primary/20`,
                open && 'bg-light-primary/10 dark:bg-dark-primary/10'
              )}
            >
              <div className='flex gap-3 truncate'>
                <UserAvatar src={photoURL} alt={name} size={40} />
                <div className='hidden truncate text-start leading-5 xl:block'>
                  <UserName name={name} className='start' verified={verified} />
                  <UserUsername username={username} disableLink />
                </div>
              </div>
              <HeroIcon
                className='hidden h-6 w-6 xl:block'
                iconName='EllipsisHorizontalIcon'
              />
            </Menu.Button>
            <AnimatePresence>
              {open && (
                <Menu.Items
                  className='menu-container absolute left-0 right-0 -top-36 w-60 xl:w-full'
                  as={motion.div}
                  {...variants}
                  static
                >
                  <Menu.Item
                    className='flex items-center justify-between gap-4 border-b
                               border-light-border px-4 py-3 dark:border-dark-border'
                    as='div'
                    disabled
                  >
                    <div className='flex items-center gap-3 truncate'>
                      <UserAvatar src={photoURL} alt={name} />
                      <div className='truncate'>
                        <UserName name={name} verified={verified} />
                        <UserUsername username={username} disableLink />
                      </div>
                    </div>
                    <i>
                      <HeroIcon
                        className='h-5 w-5 text-main-accent'
                        iconName='CheckIcon'
                      />
                    </i>
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }): JSX.Element => (
                      <Button
                        className={cn(
                          'flex w-full gap-3 rounded-md rounded-t-none p-4',
                          active && 'bg-main-sidebar-background'
                        )}
                        onClick={openModal}
                      >
                        <HeroIcon iconName='ArrowRightOnRectangleIcon' />
                        로그아웃 @{username}
                      </Button>
                    )}
                  </Menu.Item>
                  <i
                    className='absolute -bottom-[10px] left-2 translate-x-1/2 rotate-180
                               [filter:drop-shadow(#cfd9de_1px_-1px_1px)]
                               dark:[filter:drop-shadow(#333639_1px_-1px_1px)]
                               xl:left-1/2 xl:-translate-x-1/2'
                  >
                    <CustomIcon
                      className='h-4 w-6 fill-main-background'
                      iconName='TriangleIcon'
                    />
                  </i>
                </Menu.Items>
              )}
            </AnimatePresence>
          </>
        )}
      </Menu>
    </>
  );
}
