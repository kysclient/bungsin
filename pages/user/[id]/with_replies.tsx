import { AnimatePresence } from 'framer-motion';
import { doc, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from '../../../lib/hooks/useCollection';
import { useDocument } from '../../../lib/hooks/useDocument';
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
import { TweetWithParent } from '../../../components/tweet/tweet-with-parent';
import type { ReactElement, ReactNode } from 'react';

export default function UserWithReplies(): JSX.Element {
  const { user } = useUser();

  const { id, name, username, pinnedTweet } = user ?? {};

  const { data: pinnedData } = useDocument(
    doc(tweetsCollection, pinnedTweet ?? 'null'),
    {
      disabled: !pinnedTweet,
      allowNull: true,
      includeUser: true
    }
  );

  const { data, loading } = useCollection(
    query(
      tweetsCollection,
      where('createdBy', '==', id),
      orderBy('createdAt', 'desc')
    ),
    { includeUser: true, allowNull: true }
  );

  return (
    <section>
      <SEO
        title={`Tweets with replies by ${name as string} (@${
          username as string
        }) / Twitter`}
      />
      {loading ? (
        <Loading className='mt-5' />
      ) : !data ? (
        <StatsEmpty
          title={`@${username as string} 고정시켜둔 피드가 없어요.`}
          description='피드나 댓글을 고정시키면 여기에 표시됩니다.'
        />
      ) : (
        <AnimatePresence mode='popLayout'>
          {pinnedData && (
            <Tweet pinned {...pinnedData} key={`pinned-${pinnedData.id}`} />
          )}
          <TweetWithParent data={data} />
        </AnimatePresence>
      )}
    </section>
  );
}

UserWithReplies.getLayout = (page: ReactElement): ReactNode => (
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
