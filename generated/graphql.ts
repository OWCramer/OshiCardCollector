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
  /** Damage value as string to preserve modifiers like "100+"  */
  damage?: Maybe<Scalars['String']['output']>;
  /** Bonus damage against specific colors (e.g. +50 vs WHITE) */
  damageBonuses: Array<DamageBonus>;
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
  /** Structured keywords (Gift, Collab Effect, Bloom Effect, ...) */
  keywords: Array<Keyword>;
  /** Life for oshi cards */
  life?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  /** Skills for oshi cards */
  oshiSkills: Array<OshiSkill>;
  /** Historical pricing data from TCGPlayer */
  pricingData?: Maybe<PricingData>;
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
  /** TCGPlayer product ID */
  tcgId?: Maybe<Scalars['Int']['output']>;
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

export type DailyPrice = {
  __typename?: 'DailyPrice';
  date: Scalars['String']['output'];
  directLowPrice?: Maybe<Scalars['Float']['output']>;
  highPrice?: Maybe<Scalars['Float']['output']>;
  lowPrice?: Maybe<Scalars['Float']['output']>;
  marketPrice?: Maybe<Scalars['Float']['output']>;
  midPrice?: Maybe<Scalars['Float']['output']>;
};

export type DamageBonus = {
  __typename?: 'DamageBonus';
  /** Bonus amount as string (e.g. "+50") */
  amount: Scalars['String']['output'];
  /** Colors that trigger the bonus */
  colors: Array<Scalars['String']['output']>;
};

export type Keyword = {
  __typename?: 'Keyword';
  /** Keyword description / effect text */
  description: Scalars['String']['output'];
  /** Keyword title (e.g. "Bodyguard", "Not! Nin-Nin!!") */
  title: Scalars['String']['output'];
  /** Keyword type (GIFT, COLLAB, BLOOM, or other uppercase identifier) */
  type: Scalars['String']['output'];
};

export type MonthlyPrice = {
  __typename?: 'MonthlyPrice';
  date: Scalars['String']['output'];
  directLowPrice?: Maybe<Scalars['Float']['output']>;
  highPrice?: Maybe<Scalars['Float']['output']>;
  lowPrice?: Maybe<Scalars['Float']['output']>;
  marketPrice?: Maybe<Scalars['Float']['output']>;
  midPrice?: Maybe<Scalars['Float']['output']>;
};

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

export type PricingData = {
  __typename?: 'PricingData';
  dailyPrices: Array<DailyPrice>;
  monthlyPrices: Array<MonthlyPrice>;
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


export type GetCardQuery = { __typename?: 'Query', card?: { __typename?: 'Card', id: number, name: string, cardNumber: string, cardType: CardType, color: string, colors: Array<string>, rarity: string, imageUrl?: string | null, cardUrl?: string | null, hp?: number | null, life?: number | null, bloomLevel?: string | null, isBuzz: boolean, isLimited: boolean, batonPass?: Array<string> | null, extraText?: string | null, specialText?: string | null, illustrator?: string | null, releaseDate?: string | null, supportType?: string | null, setNames: Array<string>, tags: Array<string>, arts: Array<{ __typename?: 'Art', name: string, damage?: string | null, cost?: Array<string> | null, effectText?: string | null, damageBonuses: Array<{ __typename?: 'DamageBonus', amount: string, colors: Array<string> }> }>, oshiSkills: Array<{ __typename?: 'OshiSkill', name: string, skillType: OshiSkillType, cost?: string | null, usageLimit?: string | null, effectText: string }>, qna: Array<{ __typename?: 'QA', question: string, answer: string }>, keywords: Array<{ __typename?: 'Keyword', description: string, title: string, type: string }> } | null };

export type GetCardPricingQueryVariables = Exact<{
  id: Scalars['Int']['input'];
}>;


export type GetCardPricingQuery = { __typename?: 'Query', card?: { __typename?: 'Card', id: number, tcgId?: number | null, pricingData?: { __typename?: 'PricingData', monthlyPrices: Array<{ __typename?: 'MonthlyPrice', date: string, lowPrice?: number | null, midPrice?: number | null, highPrice?: number | null, marketPrice?: number | null }>, dailyPrices: Array<{ __typename?: 'DailyPrice', date: string, highPrice?: number | null, midPrice?: number | null, lowPrice?: number | null, marketPrice?: number | null }> } | null } | null };

export type GetAllCardsQueryVariables = Exact<{
  filters?: InputMaybe<CardFilter>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllCardsQuery = { __typename?: 'Query', cards: { __typename?: 'CardConnection', nodes: Array<{ __typename?: 'Card', id: number, name: string, cardNumber: string, cardType: CardType, colors: Array<string>, rarity: string, imageUrl?: string | null, hp?: number | null, bloomLevel?: string | null, isBuzz: boolean, isLimited: boolean, setNames: Array<string>, tags: Array<string>, extraText?: string | null, specialText?: string | null, releaseDate?: string | null, supportType?: string | null }> } };

export type GetAllCardsFullQueryVariables = Exact<{
  filters?: InputMaybe<CardFilter>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAllCardsFullQuery = { __typename?: 'Query', cards: { __typename?: 'CardConnection', nodes: Array<{ __typename?: 'Card', id: number, name: string, cardNumber: string, cardType: CardType, color: string, colors: Array<string>, rarity: string, imageUrl?: string | null, cardUrl?: string | null, hp?: number | null, life?: number | null, bloomLevel?: string | null, isBuzz: boolean, isLimited: boolean, batonPass?: Array<string> | null, extraText?: string | null, specialText?: string | null, illustrator?: string | null, releaseDate?: string | null, supportType?: string | null, setNames: Array<string>, tags: Array<string>, arts: Array<{ __typename?: 'Art', name: string, damage?: string | null, cost?: Array<string> | null, effectText?: string | null, damageBonuses: Array<{ __typename?: 'DamageBonus', amount: string, colors: Array<string> }> }>, oshiSkills: Array<{ __typename?: 'OshiSkill', name: string, skillType: OshiSkillType, cost?: string | null, usageLimit?: string | null, effectText: string }>, qna: Array<{ __typename?: 'QA', question: string, answer: string }>, keywords: Array<{ __typename?: 'Keyword', description: string, title: string, type: string }> }> } };

export type GetRaritiesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetRaritiesQuery = { __typename?: 'Query', rarities: Array<string> };

export type GetSetsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetSetsQuery = { __typename?: 'Query', sets: Array<string> };

export type GetColorsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetColorsQuery = { __typename?: 'Query', colors: Array<string> };

export type GetTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetTagsQuery = { __typename?: 'Query', tags: Array<string> };


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
    supportType
    setNames
    tags
    arts {
      name
      damage
      cost
      effectText
      damageBonuses {
        amount
        colors
      }
    }
    oshiSkills {
      name
      skillType
      cost
      usageLimit
      effectText
    }
    qna {
      question
      answer
    }
    keywords {
      description
      title
      type
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
export const GetCardPricingDocument = gql`
    query GetCardPricing($id: Int!) {
  card(id: $id) {
    id
    tcgId
    pricingData {
      monthlyPrices {
        date
        lowPrice
        midPrice
        highPrice
        marketPrice
      }
      dailyPrices {
        date
        highPrice
        midPrice
        lowPrice
        marketPrice
      }
    }
  }
}
    `;

/**
 * __useGetCardPricingQuery__
 *
 * To run a query within a React component, call `useGetCardPricingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCardPricingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCardPricingQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCardPricingQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GetCardPricingQuery, GetCardPricingQueryVariables> & ({ variables: GetCardPricingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetCardPricingQuery, GetCardPricingQueryVariables>(GetCardPricingDocument, options);
      }
export function useGetCardPricingLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetCardPricingQuery, GetCardPricingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetCardPricingQuery, GetCardPricingQueryVariables>(GetCardPricingDocument, options);
        }
// @ts-ignore
export function useGetCardPricingSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetCardPricingQuery, GetCardPricingQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetCardPricingQuery, GetCardPricingQueryVariables>;
export function useGetCardPricingSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCardPricingQuery, GetCardPricingQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetCardPricingQuery | undefined, GetCardPricingQueryVariables>;
export function useGetCardPricingSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetCardPricingQuery, GetCardPricingQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetCardPricingQuery, GetCardPricingQueryVariables>(GetCardPricingDocument, options);
        }
export type GetCardPricingQueryHookResult = ReturnType<typeof useGetCardPricingQuery>;
export type GetCardPricingLazyQueryHookResult = ReturnType<typeof useGetCardPricingLazyQuery>;
export type GetCardPricingSuspenseQueryHookResult = ReturnType<typeof useGetCardPricingSuspenseQuery>;
export type GetCardPricingQueryResult = Apollo.QueryResult<GetCardPricingQuery, GetCardPricingQueryVariables>;
export const GetAllCardsDocument = gql`
    query GetAllCards($filters: CardFilter, $pageSize: Int) {
  cards(filter: $filters, pageSize: $pageSize) {
    nodes {
      id
      name
      cardNumber
      cardType
      colors
      rarity
      imageUrl
      hp
      bloomLevel
      isBuzz
      isLimited
      setNames
      tags
      extraText
      specialText
      releaseDate
      supportType
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
export const GetAllCardsFullDocument = gql`
    query GetAllCardsFull($filters: CardFilter, $pageSize: Int) {
  cards(filter: $filters, pageSize: $pageSize) {
    nodes {
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
      supportType
      setNames
      tags
      arts {
        name
        damage
        cost
        effectText
        damageBonuses {
          amount
          colors
        }
      }
      oshiSkills {
        name
        skillType
        cost
        usageLimit
        effectText
      }
      qna {
        question
        answer
      }
      keywords {
        description
        title
        type
      }
    }
  }
}
    `;

/**
 * __useGetAllCardsFullQuery__
 *
 * To run a query within a React component, call `useGetAllCardsFullQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllCardsFullQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllCardsFullQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      pageSize: // value for 'pageSize'
 *   },
 * });
 */
export function useGetAllCardsFullQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>(GetAllCardsFullDocument, options);
      }
export function useGetAllCardsFullLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>(GetAllCardsFullDocument, options);
        }
// @ts-ignore
export function useGetAllCardsFullSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>;
export function useGetAllCardsFullSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetAllCardsFullQuery | undefined, GetAllCardsFullQueryVariables>;
export function useGetAllCardsFullSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>(GetAllCardsFullDocument, options);
        }
export type GetAllCardsFullQueryHookResult = ReturnType<typeof useGetAllCardsFullQuery>;
export type GetAllCardsFullLazyQueryHookResult = ReturnType<typeof useGetAllCardsFullLazyQuery>;
export type GetAllCardsFullSuspenseQueryHookResult = ReturnType<typeof useGetAllCardsFullSuspenseQuery>;
export type GetAllCardsFullQueryResult = Apollo.QueryResult<GetAllCardsFullQuery, GetAllCardsFullQueryVariables>;
export const GetRaritiesDocument = gql`
    query GetRarities {
  rarities
}
    `;

/**
 * __useGetRaritiesQuery__
 *
 * To run a query within a React component, call `useGetRaritiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRaritiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRaritiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRaritiesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetRaritiesQuery, GetRaritiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetRaritiesQuery, GetRaritiesQueryVariables>(GetRaritiesDocument, options);
      }
export function useGetRaritiesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetRaritiesQuery, GetRaritiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetRaritiesQuery, GetRaritiesQueryVariables>(GetRaritiesDocument, options);
        }
// @ts-ignore
export function useGetRaritiesSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetRaritiesQuery, GetRaritiesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetRaritiesQuery, GetRaritiesQueryVariables>;
export function useGetRaritiesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetRaritiesQuery, GetRaritiesQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetRaritiesQuery | undefined, GetRaritiesQueryVariables>;
export function useGetRaritiesSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetRaritiesQuery, GetRaritiesQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetRaritiesQuery, GetRaritiesQueryVariables>(GetRaritiesDocument, options);
        }
export type GetRaritiesQueryHookResult = ReturnType<typeof useGetRaritiesQuery>;
export type GetRaritiesLazyQueryHookResult = ReturnType<typeof useGetRaritiesLazyQuery>;
export type GetRaritiesSuspenseQueryHookResult = ReturnType<typeof useGetRaritiesSuspenseQuery>;
export type GetRaritiesQueryResult = Apollo.QueryResult<GetRaritiesQuery, GetRaritiesQueryVariables>;
export const GetSetsDocument = gql`
    query GetSets {
  sets
}
    `;

/**
 * __useGetSetsQuery__
 *
 * To run a query within a React component, call `useGetSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSetsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetSetsQuery, GetSetsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetSetsQuery, GetSetsQueryVariables>(GetSetsDocument, options);
      }
export function useGetSetsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetSetsQuery, GetSetsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetSetsQuery, GetSetsQueryVariables>(GetSetsDocument, options);
        }
// @ts-ignore
export function useGetSetsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetSetsQuery, GetSetsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetSetsQuery, GetSetsQueryVariables>;
export function useGetSetsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSetsQuery, GetSetsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetSetsQuery | undefined, GetSetsQueryVariables>;
export function useGetSetsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetSetsQuery, GetSetsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetSetsQuery, GetSetsQueryVariables>(GetSetsDocument, options);
        }
export type GetSetsQueryHookResult = ReturnType<typeof useGetSetsQuery>;
export type GetSetsLazyQueryHookResult = ReturnType<typeof useGetSetsLazyQuery>;
export type GetSetsSuspenseQueryHookResult = ReturnType<typeof useGetSetsSuspenseQuery>;
export type GetSetsQueryResult = Apollo.QueryResult<GetSetsQuery, GetSetsQueryVariables>;
export const GetColorsDocument = gql`
    query GetColors {
  colors
}
    `;

/**
 * __useGetColorsQuery__
 *
 * To run a query within a React component, call `useGetColorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetColorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetColorsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetColorsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetColorsQuery, GetColorsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetColorsQuery, GetColorsQueryVariables>(GetColorsDocument, options);
      }
export function useGetColorsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetColorsQuery, GetColorsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetColorsQuery, GetColorsQueryVariables>(GetColorsDocument, options);
        }
// @ts-ignore
export function useGetColorsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetColorsQuery, GetColorsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetColorsQuery, GetColorsQueryVariables>;
export function useGetColorsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetColorsQuery, GetColorsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetColorsQuery | undefined, GetColorsQueryVariables>;
export function useGetColorsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetColorsQuery, GetColorsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetColorsQuery, GetColorsQueryVariables>(GetColorsDocument, options);
        }
export type GetColorsQueryHookResult = ReturnType<typeof useGetColorsQuery>;
export type GetColorsLazyQueryHookResult = ReturnType<typeof useGetColorsLazyQuery>;
export type GetColorsSuspenseQueryHookResult = ReturnType<typeof useGetColorsSuspenseQuery>;
export type GetColorsQueryResult = Apollo.QueryResult<GetColorsQuery, GetColorsQueryVariables>;
export const GetTagsDocument = gql`
    query GetTags {
  tags
}
    `;

/**
 * __useGetTagsQuery__
 *
 * To run a query within a React component, call `useGetTagsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetTagsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTagsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetTagsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
      }
export function useGetTagsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
        }
// @ts-ignore
export function useGetTagsSuspenseQuery(baseOptions?: ApolloReactHooks.SuspenseQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetTagsQuery, GetTagsQueryVariables>;
export function useGetTagsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>): ApolloReactHooks.UseSuspenseQueryResult<GetTagsQuery | undefined, GetTagsQueryVariables>;
export function useGetTagsSuspenseQuery(baseOptions?: ApolloReactHooks.SkipToken | ApolloReactHooks.SuspenseQueryHookOptions<GetTagsQuery, GetTagsQueryVariables>) {
          const options = baseOptions === ApolloReactHooks.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useSuspenseQuery<GetTagsQuery, GetTagsQueryVariables>(GetTagsDocument, options);
        }
export type GetTagsQueryHookResult = ReturnType<typeof useGetTagsQuery>;
export type GetTagsLazyQueryHookResult = ReturnType<typeof useGetTagsLazyQuery>;
export type GetTagsSuspenseQueryHookResult = ReturnType<typeof useGetTagsSuspenseQuery>;
export type GetTagsQueryResult = Apollo.QueryResult<GetTagsQuery, GetTagsQueryVariables>;