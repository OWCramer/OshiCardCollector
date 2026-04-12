// @ts-nocheck
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Art = {
  __typename?: 'Art';
  /** Cost as array of colors (RED, GREEN, BLUE, WHITE, PURPLE, YELLOW, COLORLESS) */
  cost?: Maybe<Array<Scalars['String']['output']>>;
  damage?: Maybe<Scalars['Int']['output']>;
  effectText?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type Card = {
  __typename?: 'Card';
  /** Arts/moves for holomem cards */
  arts: Array<Art>;
  /** Baton pass cost for holomem cards (array of colors) */
  batonPass?: Maybe<Array<Scalars['String']['output']>>;
  /** Bloom level for holomem cards (Debut, 1st, 2nd, Spot) */
  bloomLevel?: Maybe<Scalars['String']['output']>;
  cardNumber: Scalars['String']['output'];
  cardType: CardType;
  /** URL to the card's page on the official website */
  cardUrl?: Maybe<Scalars['String']['output']>;
  /** Unified color string (e.g. "RED" or "RED, BLUE" for multi-color cards) */
  color: Scalars['String']['output'];
  /** Colors this card has (most cards have one, some have multiple) */
  colors: Array<Scalars['String']['output']>;
  /** Extra text (e.g. 'You may include any number of this holomem in the deck') */
  extraText?: Maybe<Scalars['String']['output']>;
  /** HP for holomem cards */
  hp?: Maybe<Scalars['Int']['output']>;
  id: Scalars['Int']['output'];
  illustrator?: Maybe<Scalars['String']['output']>;
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Whether this is a Buzz holomem card */
  isBuzz: Scalars['Boolean']['output'];
  /** Whether this is a LIMITED card */
  isLimited: Scalars['Boolean']['output'];
  /** Life for oshi cards */
  life?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  /** Skills for oshi cards */
  oshiSkills: Array<OshiSkill>;
  /** Q&A entries from the official site */
  qna: Array<Qa>;
  rarity: Scalars['String']['output'];
  releaseDate?: Maybe<Scalars['String']['output']>;
  /** Sets this card appears in */
  setNames: Array<Scalars['String']['output']>;
  /** Additional rules/ability text */
  specialText?: Maybe<Scalars['String']['output']>;
  /** Support subtype (Item, Staff, Mascot, Fan, Event, Tool) — only for support cards */
  supportType?: Maybe<Scalars['String']['output']>;
  tags: Array<Scalars['String']['output']>;
};

export type CardConnection = {
  __typename?: 'CardConnection';
  nodes: Array<Card>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type CardFilter = {
  bloomLevel?: InputMaybe<Scalars['String']['input']>;
  cardType?: InputMaybe<CardType>;
  color?: InputMaybe<Color>;
  /** Include buzz holomem cards (default: true). Set to false to exclude them. */
  includeBuzz?: InputMaybe<Scalars['Boolean']['input']>;
  /** Filter to only limited or non-limited cards */
  isLimited?: InputMaybe<Scalars['Boolean']['input']>;
  /** Exact match on card name (e.g. "Nanashi Mumei" returns all her cards across holomem, buzz, and oshi) */
  name?: InputMaybe<Scalars['String']['input']>;
  rarity?: InputMaybe<Scalars['String']['input']>;
  /** Search by card name (partial match) */
  search?: InputMaybe<Scalars['String']['input']>;
  setName?: InputMaybe<Scalars['String']['input']>;
  /** Filter by support subtype (ITEM, STAFF, MASCOT, FAN, EVENT, TOOL) */
  supportType?: InputMaybe<SupportType>;
  tag?: InputMaybe<Scalars['String']['input']>;
};

export type CardSort = {
  field: CardSortField;
  order?: InputMaybe<SortOrder>;
};

export enum CardSortField {
  CardNumber = 'CARD_NUMBER',
  CardType = 'CARD_TYPE',
  Color = 'COLOR',
  Hp = 'HP',
  Id = 'ID',
  Name = 'NAME',
  Rarity = 'RARITY',
  ReleaseDate = 'RELEASE_DATE'
}

export enum CardType {
  Cheer = 'CHEER',
  Holomem = 'HOLOMEM',
  Oshi = 'OSHI',
  Support = 'SUPPORT'
}

export enum Color {
  Blue = 'BLUE',
  Green = 'GREEN',
  Neutral = 'NEUTRAL',
  Purple = 'PURPLE',
  Red = 'RED',
  White = 'WHITE',
  Yellow = 'YELLOW'
}

export type OshiSkill = {
  __typename?: 'OshiSkill';
  cost?: Maybe<Scalars['String']['output']>;
  effectText: Scalars['String']['output'];
  name: Scalars['String']['output'];
  skillType: OshiSkillType;
  usageLimit?: Maybe<Scalars['String']['output']>;
};

export enum OshiSkillType {
  Oshi = 'OSHI',
  SpOshi = 'SP_OSHI'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  currentPage: Scalars['Int']['output'];
  hasNextPage: Scalars['Boolean']['output'];
  totalPages: Scalars['Int']['output'];
};

export type Qa = {
  __typename?: 'QA';
  answer: Scalars['String']['output'];
  question: Scalars['String']['output'];
};

export type Query = {
  __typename?: 'Query';
  /** Get a single card by ID or card number */
  card?: Maybe<Card>;
  /** Search and filter cards with pagination. Use pageSize: 0 to fetch all matching cards. */
  cards: CardConnection;
  /** List all unique colors */
  colors: Array<Scalars['String']['output']>;
  /** List all unique hololive member names (derived from holomem card names) */
  members: Array<Scalars['String']['output']>;
  /** List all unique rarities */
  rarities: Array<Scalars['String']['output']>;
  /** List all booster/starter sets */
  sets: Array<Scalars['String']['output']>;
  /** List all unique tags */
  tags: Array<Scalars['String']['output']>;
};


export type QueryCardArgs = {
  cardNumber?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCardsArgs = {
  filter?: InputMaybe<CardFilter>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<CardSort>;
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export enum SupportType {
  Event = 'EVENT',
  Fan = 'FAN',
  Item = 'ITEM',
  Mascot = 'MASCOT',
  Staff = 'STAFF',
  Tool = 'TOOL'
}

export type GetCardQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetCardQuery = { __typename?: 'Query', card?: { __typename?: 'Card', id: number, name: string, cardNumber: string, cardType: CardType, color: string, colors: Array<string>, rarity: string, imageUrl?: string | null, cardUrl?: string | null, hp?: number | null, life?: number | null, bloomLevel?: string | null, isBuzz: boolean, isLimited: boolean, batonPass?: Array<string> | null, extraText?: string | null, specialText?: string | null, illustrator?: string | null, releaseDate?: string | null, setNames: Array<string>, tags: Array<string>, arts: Array<{ __typename?: 'Art', name: string, damage?: number | null, cost?: Array<string> | null, effectText?: string | null }>, oshiSkills: Array<{ __typename?: 'OshiSkill', name: string, skillType: OshiSkillType, cost?: string | null, usageLimit?: string | null, effectText: string }> } | null };

export type GetAllCardsQueryVariables = Exact<{
  filters?: InputMaybe<CardFilter>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllCardsQuery = { __typename?: 'Query', cards: { __typename?: 'CardConnection', nodes: Array<{ __typename?: 'Card', name: string, id: number, imageUrl?: string | null }> } };


export const GetCardDocument = gql`
    query GetCard($id: Int!) {
  card(id: $id) {
    id
    name
    cardNumber
    cardType
    color
    colors
    rarity
    imageUrl
    cardUrl
    hp
    life
    bloomLevel
    isBuzz
    isLimited
    batonPass
    extraText
    specialText
    illustrator
    releaseDate
    setNames
    tags
    arts {
      name
      damage
      cost
      effectText
    }
    oshiSkills {
      name
      skillType
      cost
      usageLimit
      effectText
    }
  }
}
    `;

/**
 * __useGetCardQuery__
 *
 * To run a query within a React component, call `useGetCardQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCardQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCardQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCardQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetCardQuery, GetCardQueryVariables> & ({ variables: GetCardQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCardQuery, GetCardQueryVariables>(GetCardDocument, options);
      }
export function useGetCardLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCardQuery, GetCardQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCardQuery, GetCardQueryVariables>(GetCardDocument, options);
        }
// @ts-ignore
export function useGetCardSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetCardQuery, GetCardQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetCardQuery, GetCardQueryVariables>;
export function useGetCardSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCardQuery, GetCardQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetCardQuery | undefined, GetCardQueryVariables>;
export function useGetCardSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCardQuery, GetCardQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetCardQuery, GetCardQueryVariables>(GetCardDocument, options);
        }
export type GetCardQueryHookResult = ReturnType<typeof useGetCardQuery>;
export type GetCardLazyQueryHookResult = ReturnType<typeof useGetCardLazyQuery>;
export type GetCardSuspenseQueryHookResult = ReturnType<typeof useGetCardSuspenseQuery>;
export type GetCardQueryResult = Apollo.QueryResult<GetCardQuery, GetCardQueryVariables>;
export const GetAllCardsDocument = gql`
    query GetAllCards($filters: CardFilter, $pageSize: Int) {
  cards(filter: $filters, pageSize: $pageSize) {
    nodes {
      name
      id
      imageUrl
    }
  }
}
    `;

/**
 * __useGetAllCardsQuery__
 *
 * To run a query within a React component, call `useGetAllCardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllCardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllCardsQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetAllCardsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAllCardsQuery, GetAllCardsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAllCardsQuery, GetAllCardsQueryVariables>(GetAllCardsDocument, options);
      }
export function useGetAllCardsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAllCardsQuery, GetAllCardsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAllCardsQuery, GetAllCardsQueryVariables>(GetAllCardsDocument, options);
        }
// @ts-ignore
export function useGetAllCardsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetAllCardsQuery, GetAllCardsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetAllCardsQuery, GetAllCardsQueryVariables>;
export function useGetAllCardsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAllCardsQuery, GetAllCardsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetAllCardsQuery | undefined, GetAllCardsQueryVariables>;
export function useGetAllCardsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAllCardsQuery, GetAllCardsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAllCardsQuery, GetAllCardsQueryVariables>(GetAllCardsDocument, options);
        }
export type GetAllCardsQueryHookResult = ReturnType<typeof useGetAllCardsQuery>;
export type GetAllCardsLazyQueryHookResult = ReturnType<typeof useGetAllCardsLazyQuery>;
export type GetAllCardsSuspenseQueryHookResult = ReturnType<typeof useGetAllCardsSuspenseQuery>;
export type GetAllCardsQueryResult = Apollo.QueryResult<GetAllCardsQuery, GetAllCardsQueryVariables>;