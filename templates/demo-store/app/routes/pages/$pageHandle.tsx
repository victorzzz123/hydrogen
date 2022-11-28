import {
  json,
  LoaderArgs,
  MetaFunction,
  SerializeFrom,
} from '@shopify/hydrogen-remix';
import type {Page as PageType} from '@shopify/hydrogen-react/storefront-api-types';
import {useLoaderData} from '@remix-run/react';
import invariant from 'tiny-invariant';
import {PageHeader} from '~/components';

export async function loader({params, context: {storefront}}: LoaderArgs) {
  invariant(params.pageHandle, 'Missing page handle');

  const {page} = await storefront.query<{page: PageType}>(PAGE_QUERY, {
    variables: {
      handle: params.pageHandle,
    },
  });

  if (!page) {
    throw new Response('Not found', {status: 404});
  }

  return json(
    {page},
    {
      headers: {
        // TODO cacheLong()
      },
    },
  );
}

export const meta: MetaFunction = ({
  data,
}: {
  data: SerializeFrom<typeof loader> | undefined;
}) => {
  return {
    title: data?.page?.seo?.title ?? 'Page',
    description: data?.page?.seo?.description,
  };
};

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <>
      <PageHeader heading={page.title}>
        <div
          dangerouslySetInnerHTML={{__html: page.body}}
          className="prose dark:prose-invert"
        />
      </PageHeader>
    </>
  );
}

const PAGE_QUERY = `#graphql
  query PageDetails($language: LanguageCode, $handle: String!)
  @inContext(language: $language) {
    page(handle: $handle) {
      id
      title
      body
      seo {
        description
        title
      }
    }
  }
`;