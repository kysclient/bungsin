import { AnimatePresence } from 'framer-motion';
import { query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '../../../lib/hooks/useCollection';
import { tweetsCollection } from '../../../lib/firebase/collections';
import { useUser } from '../../../lib/context/user-context';
import { UserLayout, ProtectedLayout } from '../../../components/layout/common-layout';
import { MainLayout } from '../../../components/layout/main-layout';
import { SEO } from '../../../components/common/seo';
import { UserDataLayout } from '../../../components/layout/user-data-layout';
import { UserHomeLayout } from '../../../components/layout/user-home-layout';
import { Tweet } from '../../../components/tweet/tweet';
import { Loading } from '../../../components/ui/loading';
import { StatsEmpty } from '../../../components/tweet/stats-empty';
import type { ReactElement, ReactNode } from 'react';

export default function UserLikes(): JSX.Element {
  const { user } = useUser();

  const { id, name, username } = user ?? {};

  const { data, loading } = useCollection(
    query(
      tweetsCollection,
      where('userLikes', 'array-contains', id),
      orderBy('createdAt', 'desc')
    ),
    { includeUser: true, allowNull: true }
  );

  return (
    <section>
      <SEO
        title={`Tweets liked by ${name as string} (@${
          username as string
        }) / Twitter`}
      />
      {loading ? (
        <Loading className='mt-5' />
      ) : !data ? (
        <StatsEmpty
          title={`@${username as string} 좋아하는 피드가 없어요.`}
          description='좋아요를 누른다면 여기에 표시됩니다.'
        />
      ) : (
        <AnimatePresence mode='popLayout'>
          {data.map((tweet) => (
            <Tweet {...tweet} key={tweet.id} />
          ))}
        </AnimatePresence>
      )}
    </section>
  );
}

UserLikes.getLayout = (page: ReactElement): ReactNode => (
  <ProtectedLayout>
    <MainLayout>
      <UserLayout>
        <UserDataLayout>
          <UserHomeLayout>{page}</UserHomeLayout>
        </UserDataLayout>
      </UserLayout>
    </MainLayout>
  </ProtectedLayout>
);
